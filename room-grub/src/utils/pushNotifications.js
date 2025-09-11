import { createClient } from '@/utils/supabase/client';

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

class PushNotificationManager {
    constructor() {
        this.supabase = createClient();
        this.registration = null;
    }

    // Check if push notifications are supported
    isSupported() {
        const hasServiceWorker = 'serviceWorker' in navigator;
        const hasPushManager = 'PushManager' in window;
        const hasNotification = 'Notification' in window;
        const hasNavigatorSW = !!navigator.serviceWorker;
        const hasWindowPM = !!window.PushManager;
        const isSecureContext = window.isSecureContext;
        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        
        const isSupported = hasServiceWorker && hasPushManager && hasNotification && hasNavigatorSW && hasWindowPM && (isSecureContext || isLocalhost);
        
        if (!isSupported) {
            console.log('Push notification support check:', {
                hasServiceWorker,
                hasPushManager,
                hasNotification,
                hasNavigatorSW,
                hasWindowPM,
                isSecureContext,
                isLocalhost,
                protocol: location.protocol,
                hostname: location.hostname,
                isSupported
            });
        }
        
        return isSupported;
    }

    // Get notification permission
    async getPermission() {
        if (!this.isSupported()) {
            throw new Error('Push notifications are not supported');
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    // Check detailed browser compatibility for push subscriptions
    checkBrowserCompatibility() {
        const reasons = [];
        let isSupported = true;

        // Basic service worker support
        if (!('serviceWorker' in navigator)) {
            reasons.push('Service Worker not supported');
            isSupported = false;
        }

        // Push Manager support
        if (!('PushManager' in window)) {
            reasons.push('Push Manager not supported');
            isSupported = false;
        }

        // Check for known problematic browsers/versions
        const userAgent = navigator.userAgent;
        const browserInfo = {
            isFirefox: userAgent.includes('Firefox'),
            isChrome: userAgent.includes('Chrome') && !userAgent.includes('Edge'),
            isEdge: userAgent.includes('Edge'),
            isSafari: userAgent.includes('Safari') && !userAgent.includes('Chrome'),
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: userAgent.includes('Android')
        };

        // Safari has limited push support
        if (browserInfo.isSafari && !browserInfo.isIOS) {
            // Safari on macOS needs special handling
            reasons.push('Safari desktop has limited push support');
        }

        // iOS Safari has very limited push support
        if (browserInfo.isIOS) {
            const iosVersion = userAgent.match(/OS (\d+)_(\d+)/);
            if (iosVersion) {
                const majorVersion = parseInt(iosVersion[1]);
                if (majorVersion < 16) {
                    reasons.push('iOS version too old for reliable push support');
                    isSupported = false;
                }
            }
        }

        return {
            isSupported,
            reasons,
            browserInfo,
            capabilities: {
                hasServiceWorker: 'serviceWorker' in navigator,
                hasPushManager: 'PushManager' in window,
                hasNotifications: 'Notification' in window,
                hasPromiseSupport: typeof Promise !== 'undefined'
            }
        };
    }

    // Register service worker
    async registerServiceWorker() {
        if (!this.isSupported()) {
            throw new Error('Service workers are not supported');
        }

        try {
            // First try to get the existing registration
            this.registration = await navigator.serviceWorker.getRegistration();
            
            if (this.registration) {
                console.log('Using existing service worker registration');
                console.log('SW State:', this.registration.active?.state);
                
                // Wait for service worker to be ready if it's not already active
                if (!this.registration.active || this.registration.active.state !== 'activated') {
                    console.log('Waiting for service worker to be ready...');
                    await navigator.serviceWorker.ready;
                    this.registration = await navigator.serviceWorker.getRegistration();
                }
                
                return this.registration;
            }

            // If no existing registration, register the main service worker
            console.log('No existing registration found, registering new service worker...');
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'imports' // Allow updates but cache imports
            });
            console.log('Service Worker registered successfully');
            
            // Enhanced waiting for service worker readiness
            console.log('Waiting for service worker to be ready...');
            const readyRegistration = await navigator.serviceWorker.ready;
            
            // Double-check we got the right registration
            if (readyRegistration.scope === this.registration.scope) {
                this.registration = readyRegistration;
            } else {
                console.warn('Ready registration scope mismatch, getting fresh registration');
                this.registration = await navigator.serviceWorker.getRegistration();
            }
            
            // Final validation
            if (!this.registration || !this.registration.active) {
                throw new Error('Service worker registration completed but no active worker found');
            }
            
            console.log('Service worker registration and activation completed successfully');
            return this.registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            throw error;
        }
    }

    // Ensure service worker is ready and active
    async ensureServiceWorkerReady() {
        if (!this.registration) {
            throw new Error('Service worker registration not found');
        }

        console.log('Validating service worker readiness...');
        console.log('Service worker state:', {
            installing: !!this.registration.installing,
            waiting: !!this.registration.waiting,
            active: !!this.registration.active,
            scope: this.registration.scope
        });

        // If service worker is installing, wait for it
        if (this.registration.installing) {
            console.log('Service worker is installing, waiting for activation...');
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Service worker installation timeout'));
                }, 30000); // 30 second timeout

                const checkState = () => {
                    console.log('Service worker install state:', this.registration.installing?.state);
                    if (this.registration.installing?.state === 'activated') {
                        clearTimeout(timeout);
                        resolve();
                    } else if (this.registration.installing?.state === 'redundant') {
                        clearTimeout(timeout);
                        reject(new Error('Service worker became redundant during installation'));
                    }
                };

                this.registration.installing.addEventListener('statechange', checkState);
                // Check initial state
                checkState();
            });
        }

        // If there's a waiting service worker, try to activate it
        if (this.registration.waiting) {
            console.log('Service worker is waiting, attempting to activate...');
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Wait for activation
            await new Promise((resolve) => {
                const checkActivation = () => {
                    if (this.registration.active) {
                        resolve();
                    } else {
                        setTimeout(checkActivation, 100);
                    }
                };
                checkActivation();
            });
        }

        // Ensure we have an active service worker with enhanced debugging
        if (!this.registration.active) {
            console.error('No active service worker found after readiness check');
            console.error('Service worker final state:', {
                installing: !!this.registration.installing,
                waiting: !!this.registration.waiting, 
                active: !!this.registration.active,
                scope: this.registration.scope,
                updatefound: this.registration.updatefound
            });
            
            // Try one more time to get the registration
            try {
                console.log('Attempting to get fresh service worker registration...');
                const freshRegistration = await navigator.serviceWorker.getRegistration();
                if (freshRegistration && freshRegistration.active) {
                    console.log('Found active service worker in fresh registration');
                    this.registration = freshRegistration;
                } else {
                    // Last resort: try to re-register the service worker
                    console.log('Attempting emergency service worker re-registration...');
                    await this.emergencyServiceWorkerReregistration();
                    return this.ensureServiceWorkerReady(); // Recursive call
                }
            } catch (recoveryError) {
                console.error('Failed to recover service worker:', recoveryError);
                throw new Error(`Service worker failed to activate. Details: ${recoveryError.message}. Try refreshing the page or clearing browser cache.`);
            }
        }

        // Validate push manager availability
        if (!this.registration.pushManager) {
            throw new Error('Push Manager not available on service worker');
        }

        console.log('Service worker is ready and active');
        return true;
    }

    // Clear push-related storage to fix storage errors
    async clearPushRelatedStorage() {
        console.log('Attempting to clear push-related storage...');
        
        try {
            // Clear service worker caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                console.log('Found caches:', cacheNames);
                
                for (const cacheName of cacheNames) {
                    await caches.delete(cacheName);
                    console.log('Deleted cache:', cacheName);
                }
            }
        } catch (error) {
            console.warn('Failed to clear caches:', error);
        }

        try {
            // Clear local storage items related to push notifications
            const pushKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('push') || key.includes('notification') || key.includes('sw'))) {
                    pushKeys.push(key);
                }
            }
            
            pushKeys.forEach(key => {
                localStorage.removeItem(key);
                console.log('Removed localStorage key:', key);
            });
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }

        try {
            // Clear session storage items related to push notifications
            const pushSessionKeys = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && (key.includes('push') || key.includes('notification') || key.includes('sw'))) {
                    pushSessionKeys.push(key);
                }
            }
            
            pushSessionKeys.forEach(key => {
                sessionStorage.removeItem(key);
                console.log('Removed sessionStorage key:', key);
            });
        } catch (error) {
            console.warn('Failed to clear sessionStorage:', error);
        }

        try {
            // Clear IndexedDB databases related to push (if accessible)
            if ('indexedDB' in window) {
                // Note: We can't easily enumerate all IndexedDB databases
                // but we can try to delete known service worker related ones
                const dbsToTry = ['workbox-cache-info', 'workbox-cache-data', 'sw-cache'];
                
                for (const dbName of dbsToTry) {
                    try {
                        const deleteRequest = indexedDB.deleteDatabase(dbName);
                        await new Promise((resolve, reject) => {
                            deleteRequest.onsuccess = () => {
                                console.log('Deleted IndexedDB:', dbName);
                                resolve();
                            };
                            deleteRequest.onerror = () => resolve(); // Don't fail if DB doesn't exist
                            deleteRequest.onblocked = () => {
                                console.warn('IndexedDB deletion blocked for:', dbName);
                                resolve();
                            };
                        });
                    } catch (error) {
                        console.warn(`Failed to delete IndexedDB ${dbName}:`, error);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to clear IndexedDB:', error);
        }

        console.log('Storage clearing completed');
    }

    // Clear browser push notification storage (for corrupted states)
    async clearBrowserPushStorage() {
        console.log('Clearing browser push notification storage...');
        
        try {
            // Clear all push subscriptions
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                if (registration.pushManager) {
                    try {
                        const subscription = await registration.pushManager.getSubscription();
                        if (subscription) {
                            console.log('Removing existing push subscription...');
                            await subscription.unsubscribe();
                        }
                    } catch (error) {
                        console.warn('Error removing push subscription:', error);
                    }
                }
            }
            
            // Clear relevant localStorage/sessionStorage items
            try {
                const storageKeys = ['pushNotifications', 'sw-cache', 'pushSubscription', 'notifications'];
                storageKeys.forEach(key => {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                });
                console.log('Cleared push-related storage items');
            } catch (storageError) {
                console.warn('Error clearing storage:', storageError);
            }
            
            // Clear IndexedDB databases related to push notifications
            try {
                if ('indexedDB' in window) {
                    const dbsToDelete = ['workbox-expiration', 'push-subscriptions', 'notifications'];
                    for (const dbName of dbsToDelete) {
                        try {
                            await new Promise((resolve, reject) => {
                                const deleteReq = indexedDB.deleteDatabase(dbName);
                                deleteReq.onerror = () => resolve(); // Don't fail if DB doesn't exist
                                deleteReq.onsuccess = () => resolve();
                                deleteReq.onblocked = () => resolve();
                                setTimeout(() => resolve(), 2000); // Timeout after 2s
                            });
                        } catch (dbError) {
                            console.warn(`Error deleting IndexedDB ${dbName}:`, dbError);
                        }
                    }
                    console.log('Cleared push-related IndexedDB databases');
                }
            } catch (idbError) {
                console.warn('Error clearing IndexedDB:', idbError);
            }
            
            // Clear cache storage related to push notifications
            try {
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    const pushRelatedCaches = cacheNames.filter(name => 
                        name.includes('push') || name.includes('notification') || name.includes('sw')
                    );
                    for (const cacheName of pushRelatedCaches) {
                        await caches.delete(cacheName);
                    }
                    console.log('Cleared push-related cache storage');
                }
            } catch (cacheError) {
                console.warn('Error clearing cache storage:', cacheError);
            }
            
            console.log('Browser push storage clearing completed');
            
        } catch (error) {
            console.error('Error during browser push storage clearing:', error);
            throw error;
        }
    }

    // Emergency service worker re-registration for activation failures
    async emergencyServiceWorkerReregistration() {
        console.log('Starting emergency service worker re-registration...');
        
        try {
            // First, try to unregister all existing service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`Found ${registrations.length} existing registrations`);
            
            for (const registration of registrations) {
                try {
                    console.log('Unregistering service worker with scope:', registration.scope);
                    await registration.unregister();
                } catch (unregError) {
                    console.warn('Failed to unregister service worker:', unregError);
                }
            }
            
            // Wait a moment for cleanup
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Re-register the service worker
            console.log('Re-registering service worker...');
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none' // Force fresh download
            });
            
            console.log('Emergency re-registration completed');
            
            // Wait for it to be ready
            await navigator.serviceWorker.ready;
            
            // Get the fresh registration
            this.registration = await navigator.serviceWorker.getRegistration();
            
            if (!this.registration) {
                throw new Error('Registration still not found after emergency re-registration');
            }
            
            console.log('Emergency service worker recovery successful');
            
        } catch (error) {
            console.error('Emergency service worker re-registration failed:', error);
            throw error;
        }
    }

    // Validate and convert VAPID public key
    validateAndConvertVAPIDKey(publicKey) {
        console.log('Validating VAPID public key...');
        console.log('VAPID public key length:', publicKey.length);
        console.log('VAPID public key (first 20 chars):', publicKey.substring(0, 20) + '...');

        // Basic validation
        if (typeof publicKey !== 'string') {
            throw new Error('VAPID public key must be a string');
        }

        if (publicKey.length === 0) {
            throw new Error('VAPID public key is empty');
        }

        // Check if it's a valid base64url string
        const base64urlPattern = /^[A-Za-z0-9_-]+$/;
        if (!base64urlPattern.test(publicKey)) {
            throw new Error('VAPID public key contains invalid characters for base64url encoding');
        }

        // Standard VAPID key should be 65 bytes when decoded (516 bits for P-256)
        // In base64url, this translates to about 87-88 characters
        if (publicKey.length < 80 || publicKey.length > 100) {
            console.warn(`VAPID key length (${publicKey.length}) is outside expected range (80-100 characters)`);
        }

        try {
            const applicationServerKey = urlBase64ToUint8Array(publicKey);
            
            console.log('VAPID key converted successfully');
            console.log('Converted key length:', applicationServerKey.length);
            console.log('Expected length: 65 bytes');

            // Validate the converted key length
            if (applicationServerKey.length !== 65) {
                console.warn(`Converted VAPID key length (${applicationServerKey.length}) is not the expected 65 bytes`);
                // Don't throw error as some implementations might vary slightly
            }

            // Additional validation: check if it starts with 0x04 (uncompressed point indicator for P-256)
            if (applicationServerKey[0] !== 0x04) {
                console.warn('VAPID key does not start with 0x04 (uncompressed point indicator)');
            }

            console.log('VAPID key validation and conversion successful');
            return applicationServerKey;

        } catch (error) {
            console.error('Failed to convert VAPID key:', error);
            console.error('VAPID key details:', {
                length: publicKey.length,
                startsCorrectly: publicKey.startsWith('B'),
                endsCorrectly: !publicKey.endsWith('='), // base64url should not have padding
                sampleChars: publicKey.substring(0, 10)
            });

            // Try to provide more specific error messages
            if (error.message.includes('Invalid character')) {
                throw new Error('VAPID public key contains invalid base64url characters. Ensure it uses only A-Z, a-z, 0-9, -, and _ characters.');
            } else if (error.message.includes('Invalid length')) {
                throw new Error(`VAPID public key has invalid length. Expected approximately 87 characters, got ${publicKey.length}.`);
            } else {
                throw new Error(`Invalid VAPID public key format: ${error.message}`);
            }
        }
    }

    // Subscribe to push notifications
    async subscribe(userId, roomId) {
        try {
            // Check browser compatibility first
            const compatibility = this.checkBrowserCompatibility();
            if (!compatibility.isSupported) {
                throw new Error(`Browser not compatible with push notifications: ${compatibility.reasons.join(', ')}`);
            }
            
            console.log('Browser compatibility check passed:', compatibility);

            // Ensure service worker is ready
            if (!this.registration) {
                await this.registerServiceWorker();
            }

            // Enhanced service worker readiness validation
            await this.ensureServiceWorkerReady();

            const hasPermission = await this.getPermission();
            if (!hasPermission) {
                throw new Error('Notification permission denied');
            }

            const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicKey) {
                throw new Error('VAPID public key not configured');
            }

            console.log('Attempting to subscribe to push notifications...');
            console.log('Service worker registration:', this.registration);
            console.log('PushManager available:', !!this.registration.pushManager);
            
            // Comprehensive VAPID key validation and conversion
            const applicationServerKey = this.validateAndConvertVAPIDKey(publicKey);

            // Try to subscribe with retry mechanism and fallback strategies
            let subscription = null;
            let retryCount = 0;
            const maxRetries = 8; // Increased retries for more approaches
            // Enhanced Chrome detection
            const isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edge');
            const chromeVersion = isChrome ? parseInt(navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || '0') : 0;
            console.log(`Browser: ${isChrome ? 'Chrome' : 'Other'}, Version: ${chromeVersion}`);
            
            const subscriptionStrategies = [
                // Strategy 1: Standard approach
                { name: 'standard', cleanExisting: true, waitTime: 0 },
                // Strategy 2: Without cleaning existing subscription
                { name: 'keep-existing', cleanExisting: false, waitTime: 1500 },
                // Strategy 3: Clear storage and retry (for storage errors)
                { name: 'clear-storage', cleanExisting: true, waitTime: 2500, clearStorage: true },
                // Strategy 4: AGGRESSIVE storage clearing for Chrome
                { name: 'clear-browser-storage', cleanExisting: true, waitTime: 3000, clearBrowserStorage: true, chromeSpecific: true },
                // Strategy 5: With longer wait and service worker validation
                { name: 'delayed-validated', cleanExisting: true, waitTime: 4000, validateSW: true },
                // Strategy 6: Force service worker refresh
                { name: 'sw-refresh', cleanExisting: true, waitTime: 3000, refreshSW: true, alternativeMethod: true },
                // Strategy 7: Chrome empty object fix - force new registration
                { name: 'chrome-fix', cleanExisting: true, waitTime: 5000, forceNewRegistration: true, alternativeMethod: true },
                // Strategy 8: Nuclear option - complete reset
                { name: 'nuclear-reset', cleanExisting: true, waitTime: 7000, clearBrowserStorage: true, forceNewRegistration: true, alternativeMethod: true }
            ];
            
            while (!subscription && retryCount < maxRetries) {
                const strategy = subscriptionStrategies[retryCount] || subscriptionStrategies[0];
                
                try {
                    console.log(`Subscription attempt ${retryCount + 1}/${maxRetries} using strategy: ${strategy.name}`);
                    
                    // Wait if strategy requires it
                    if (strategy.waitTime > 0) {
                        console.log(`Waiting ${strategy.waitTime}ms before attempt...`);
                        await new Promise(resolve => setTimeout(resolve, strategy.waitTime));
                    }
                    
                    // Refresh service worker if strategy requires it
                    if (strategy.refreshSW) {
                        console.log('Refreshing service worker...');
                        await this.registration.update();
                        // Wait for update to complete
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    
                    // Clear storage if strategy requires it (for storage errors)
                    if (strategy.clearStorage) {
                        console.log('Clearing browser storage to fix storage errors...');
                        try {
                            await this.clearPushRelatedStorage();
                        } catch (storageError) {
                            console.warn('Failed to clear storage:', storageError);
                            // Continue anyway
                        }
                    }
                    
                    // AGGRESSIVE browser storage clearing for Chrome issues
                    if (strategy.clearBrowserStorage) {
                        // Skip non-Chrome browsers unless it's the nuclear option
                        if (!isChrome && strategy.name !== 'nuclear-reset') {
                            console.log('Skipping browser storage clearing for non-Chrome browser');
                        } else {
                            try {
                                console.log(`Executing aggressive browser storage clearing (${strategy.name})...`);
                                await this.clearBrowserPushStorage();
                                // Wait extra time after storage clearing
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            } catch (clearError) {
                                console.warn('Error during aggressive browser storage clearing:', clearError);
                                // Don't fail the entire strategy, continue with subscription attempt
                            }
                        }
                    }
                    
                    // Force new service worker registration if strategy requires it (Chrome fix)
                    if (strategy.forceNewRegistration) {
                        console.log('Forcing new service worker registration for Chrome empty object fix...');
                        try {
                            // Unregister current service worker
                            await this.registration.unregister();
                            // Wait a moment
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            // Re-register
                            await this.registerServiceWorker();
                            // Ensure it's ready
                            await this.ensureServiceWorkerReady();
                        } catch (regError) {
                            console.warn('Failed to force new registration:', regError);
                            // Continue with existing registration
                        }
                    }
                    
                    // Enhanced service worker validation if strategy requires it
                    if (strategy.validateSW) {
                        console.log('Validating service worker state...');
                        
                        // Check service worker states
                        const swStates = {
                            installing: !!this.registration.installing,
                            waiting: !!this.registration.waiting,
                            active: !!this.registration.active,
                            scope: this.registration.scope
                        };
                        console.log('Service worker states:', swStates);
                        
                        // Wait for service worker to become active
                        let waitAttempts = 0;
                        const maxWaitAttempts = 10;
                        
                        while (!this.registration.active && waitAttempts < maxWaitAttempts) {
                            console.log(`Service worker not active, waiting... (attempt ${waitAttempts + 1}/${maxWaitAttempts})`);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            waitAttempts++;
                            
                            // Refresh registration to get latest state
                            this.registration = await navigator.serviceWorker.getRegistration() || this.registration;
                        }
                        
                        if (!this.registration.active) {
                            throw new Error('Service worker failed to become active after validation period');
                        }
                        
                        // Additional check: ensure pushManager is available
                        if (!this.registration.pushManager) {
                            throw new Error('PushManager not available on service worker registration');
                        }
                        
                        console.log('Service worker validation passed');
                    }
                    
                    // Check if there's an existing subscription
                    const existingSub = await this.registration.pushManager.getSubscription();
                    if (existingSub && strategy.cleanExisting) {
                        console.log('Found existing subscription, unsubscribing first...');
                        try {
                            await existingSub.unsubscribe();
                        } catch (unsubError) {
                            console.warn('Failed to unsubscribe existing subscription:', unsubError);
                            // Continue anyway
                        }
                    }
                    
                    // Prepare subscription options
                    let subscribeOptions = {
                        userVisibleOnly: true,
                        applicationServerKey: applicationServerKey
                    };
                    
                    // Use different options for last resort strategy
                    if (strategy.differentOptions) {
                        subscribeOptions = {
                            userVisibleOnly: true,
                            applicationServerKey: applicationServerKey
                        };
                        // Some browsers might need explicit user visible only
                        console.log('Using alternative subscription options');
                    }
                    
                    // Try multiple subscription methods
                    if (strategy.alternativeMethod && retryCount > 3) {
                        console.log('Trying alternative subscription method...');
                        
                        // Method 1: Try with different applicationServerKey format
                        try {
                            const altOptions = {
                                ...subscribeOptions,
                                applicationServerKey: subscribeOptions.applicationServerKey.buffer || subscribeOptions.applicationServerKey
                            };
                            console.log('Attempting subscription with buffer format key...');
                            subscription = await this.registration.pushManager.subscribe(altOptions);
                        } catch (altError) {
                            console.warn('Alternative method 1 failed:', altError);
                        }
                        
                        // Method 2: If still failed, try with explicit options
                        if (!subscription) {
                            try {
                                const explicitOptions = {
                                    userVisibleOnly: true,
                                    applicationServerKey: new Uint8Array(subscribeOptions.applicationServerKey)
                                };
                                console.log('Attempting subscription with explicit Uint8Array...');
                                subscription = await this.registration.pushManager.subscribe(explicitOptions);
                            } catch (explicitError) {
                                console.warn('Alternative method 2 failed:', explicitError);
                            }
                        }
                    }
                    
                    // Standard subscription method
                    if (!subscription) {
                        console.log('Using standard subscription method...');
                        subscription = await this.registration.pushManager.subscribe(subscribeOptions);
                    }
                    
                    // COMPREHENSIVE RAW SUBSCRIPTION LOGGING FOR DEBUGGING
                    console.log('=== RAW SUBSCRIPTION OBJECT ANALYSIS ===');
                    console.log('Raw subscription object:', subscription);
                    console.log('Subscription type:', typeof subscription);
                    console.log('Subscription constructor:', subscription ? subscription.constructor.name : 'N/A');
                    console.log('Subscription prototype:', subscription ? Object.getPrototypeOf(subscription) : 'N/A');
                    
                    // Log all properties (enumerable and non-enumerable)
                    if (subscription) {
                        const allProps = Object.getOwnPropertyNames(subscription);
                        const enumerableProps = Object.keys(subscription);
                        console.log('All properties:', allProps);
                        console.log('Enumerable properties:', enumerableProps);
                        console.log('Non-enumerable properties:', allProps.filter(p => !enumerableProps.includes(p)));
                        
                        // Try to access key properties directly
                        console.log('Direct property access:');
                        console.log('  subscription.endpoint:', subscription.endpoint);
                        console.log('  subscription.keys:', subscription.keys);
                        console.log('  subscription.options:', subscription.options);
                        
                        // Test different serialization methods
                        console.log('Serialization tests:');
                        try {
                            const json1 = JSON.stringify(subscription);
                            console.log('  JSON.stringify result length:', json1.length);
                            console.log('  JSON.stringify result:', json1.substring(0, 100) + (json1.length > 100 ? '...' : ''));
                        } catch (e) {
                            console.log('  JSON.stringify failed:', e.message);
                        }
                        
                        try {
                            const json2 = subscription.toJSON ? subscription.toJSON() : null;
                            console.log('  toJSON() result:', json2);
                            if (json2) {
                                console.log('  toJSON() keys:', Object.keys(json2));
                            }
                        } catch (e) {
                            console.log('  toJSON() failed:', e.message);
                        }
                        
                        // Check if it's a PushSubscription instance
                        console.log('instanceof PushSubscription:', subscription instanceof PushSubscription);
                    }
                    console.log('=== END RAW SUBSCRIPTION ANALYSIS ===');
                    
                    // Immediate validation of subscription object structure
                    if (subscription && typeof subscription === 'object') {
                        const properties = Object.getOwnPropertyNames(subscription);
                        console.log('Subscription properties after creation:', properties);
                        
                        // Better validation: check for actual subscription properties
                        const hasEndpoint = subscription.endpoint && typeof subscription.endpoint === 'string';
                        const hasKeys = subscription.keys || subscription.getKey;
                        let serializable = false;
                        
                        // Test if subscription can be serialized (crucial for Chrome)
                        try {
                            const jsonData = subscription.toJSON ? subscription.toJSON() : JSON.parse(JSON.stringify(subscription));
                            serializable = jsonData && jsonData.endpoint && (jsonData.keys || Object.keys(jsonData).length > 0);
                            console.log('Subscription serialization test:', { 
                                hasEndpoint: !!jsonData.endpoint, 
                                hasKeys: !!jsonData.keys,
                                keysCount: jsonData.keys ? Object.keys(jsonData.keys).length : 0
                            });
                        } catch (serError) {
                            console.warn('Subscription serialization failed:', serError);
                        }
                        
                        // If subscription can't be serialized or lacks essential properties, it's malformed
                        // Note: Don't check properties.length === 0 as Chrome implements PushSubscription properties as prototype getters
                        if (!hasEndpoint || !serializable) {
                            const errorDetails = {
                                propertiesCount: properties.length,
                                hasEndpoint,
                                hasKeys,
                                serializable,
                                properties: properties.slice(0, 5) // First 5 properties for debugging
                            };
                            console.error('Received invalid/empty subscription object:', errorDetails);
                            subscription = null;
                            throw new Error(`Invalid subscription object: ${JSON.stringify(errorDetails)}`);
                        }
                        
                        // If subscription lacks keys, try to access them differently
                        if (!subscription.keys && subscription.getKey) {
                            console.log('Subscription missing keys property, trying getKey method...');
                            try {
                                const p256dh = subscription.getKey('p256dh');
                                const auth = subscription.getKey('auth');
                                if (p256dh && auth) {
                                    // Manually create keys object
                                    subscription.keys = {
                                        p256dh: new Uint8Array(p256dh),
                                        auth: new Uint8Array(auth)
                                    };
                                    console.log('Successfully created keys object from getKey method');
                                }
                            } catch (getKeyError) {
                                console.error('getKey method failed:', getKeyError);
                            }
                        }
                    }
                    
                    console.log(`Subscription created successfully with strategy: ${strategy.name}`);
                    break;
                    
                } catch (subError) {
                    console.error(`Subscription attempt ${retryCount + 1} failed with strategy ${strategy.name}:`, subError);
                    console.error('Error details:', {
                        name: subError.name,
                        message: subError.message,
                        stack: subError.stack?.split('\n')[0]
                    });
                    
                    // Special handling for storage errors
                    if (subError.name === 'AbortError' && subError.message.includes('storage')) {
                        console.error('Detected storage error - this may be due to:');
                        console.error('1. Browser storage quota exceeded');
                        console.error('2. Service worker storage corruption');
                        console.error('3. Insufficient disk space');
                        console.error('4. Browser security restrictions');
                        
                        // If we haven't tried the clear-storage strategy yet, prioritize it
                        if (strategy.name !== 'clear-storage' && retryCount < maxRetries) {
                            console.log('Will prioritize clear-storage strategy for next attempt');
                        }
                    }
                    
                    retryCount++;
                    
                    if (retryCount < maxRetries) {
                        const nextStrategy = subscriptionStrategies[retryCount] || subscriptionStrategies[0];
                        console.log(`Will try strategy: ${nextStrategy.name} in next attempt`);
                    }
                }
            }
            
            if (!subscription) {
                const finalError = new Error(`Failed to create subscription after ${maxRetries} attempts. This may be due to browser storage issues, security restrictions, or service worker problems. Try clearing your browser cache and storage, then refresh the page.`);
                finalError.name = 'PushSubscriptionError';
                throw finalError;
            }

            console.log('Raw subscription object:', subscription);
            console.log('Subscription endpoint:', subscription?.endpoint);
            console.log('Subscription keys:', subscription?.keys);
            console.log('Keys p256dh:', subscription?.keys?.p256dh);
            console.log('Keys auth:', subscription?.keys?.auth);

            // Enhanced logging for debugging
            console.log('Subscription object type:', typeof subscription);
            console.log('Subscription constructor:', subscription?.constructor?.name);
            console.log('Subscription properties:', Object.getOwnPropertyNames(subscription || {}));
            console.log('Browser info:', {
                userAgent: navigator.userAgent,
                vendor: navigator.vendor,
                platform: navigator.platform
            });

            // Validate subscription object
            if (!subscription) {
                throw new Error('No subscription object received');
            }

            if (!subscription.endpoint) {
                const errorDetails = {
                    subscriptionType: typeof subscription,
                    properties: Object.getOwnPropertyNames(subscription),
                    hasEndpoint: 'endpoint' in subscription,
                    endpointValue: subscription.endpoint
                };
                console.error('Subscription endpoint validation failed:', errorDetails);
                throw new Error(`Subscription missing endpoint. Details: ${JSON.stringify(errorDetails)}`);
            }

            if (!subscription.keys) {
                const errorDetails = {
                    subscriptionType: typeof subscription,
                    properties: Object.getOwnPropertyNames(subscription),
                    hasKeys: 'keys' in subscription,
                    keysValue: subscription.keys,
                    keysType: typeof subscription.keys,
                    browser: {
                        userAgent: navigator.userAgent,
                        vendor: navigator.vendor,
                        platform: navigator.platform
                    }
                };
                console.error('Subscription keys validation failed:', errorDetails);
                
                // Specific error message for the Chrome empty object issue
                if (errorDetails.properties.length === 0) {
                    throw new Error(`Chrome returned empty subscription object. This is a known Chrome issue. Browser: ${navigator.userAgent.split(' ')[0]}. Try refreshing the page and enabling notifications again. Details: ${JSON.stringify(errorDetails)}`);
                }
                
                throw new Error(`Subscription missing keys object. Browser: ${navigator.userAgent.split(' ')[0]}. Details: ${JSON.stringify(errorDetails)}`);
            }

            if (!subscription.keys.p256dh) {
                throw new Error('Subscription missing p256dh key');
            }

            if (!subscription.keys.auth) {
                throw new Error('Subscription missing auth key');
            }

            console.log('Subscription validation passed');

            // Save subscription to database
            await this.saveSubscription(userId, roomId, subscription);
            
            console.log('Push notification subscription successful');
            return subscription;
        } catch (error) {
            console.error('Push notification subscription failed:', error);
            console.error('Error details:', error.message);
            throw error;
        }
    }

    // Save subscription to database
    async saveSubscription(userId, roomId, subscription) {
        try {
            const { data: session } = await this.supabase.auth.getSession();
            if (!session?.session) {
                throw new Error('User not authenticated');
            }

            const subscriptionData = {
                user_id: userId,
                room_id: roomId,
                endpoint: subscription.endpoint,
                p256dh_key: subscription.keys.p256dh,
                auth_key: subscription.keys.auth
            };

            const { error } = await this.supabase
                .from('push_subscriptions')
                .upsert(subscriptionData, {
                    onConflict: 'user_id,room_id',
                    ignoreDuplicates: false
                });

            if (error) throw error;
            
            console.log('Subscription saved to database');
        } catch (error) {
            console.error('Error saving subscription:', error);
            throw error;
        }
    }

    // Unsubscribe from push notifications
    async unsubscribe(userId, roomId) {
        try {
            if (!this.registration) {
                this.registration = await navigator.serviceWorker.getRegistration();
            }

            if (this.registration) {
                const subscription = await this.registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                }
            }

            // Remove subscription from database
            await this.removeSubscription(userId, roomId);
            
            console.log('Push notification unsubscribed successfully');
        } catch (error) {
            console.error('Push notification unsubscribe failed:', error);
            throw error;
        }
    }

    // Remove subscription from database
    async removeSubscription(userId, roomId) {
        try {
            const { error } = await this.supabase
                .from('push_subscriptions')
                .delete()
                .eq('user_id', userId)
                .eq('room_id', roomId);

            if (error) throw error;
            
            console.log('Subscription removed from database');
        } catch (error) {
            console.error('Error removing subscription:', error);
            throw error;
        }
    }

    // Check if user is subscribed
    async isSubscribed(userId, roomId) {
        try {
            const { data: subscription, error } = await this.supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .eq('room_id', roomId)
                .single();

            return !error && subscription;
        } catch (error) {
            return false;
        }
    }

    // Get subscription status
    async getSubscriptionStatus() {
        try {
            if (!this.registration) {
                this.registration = await navigator.serviceWorker.getRegistration();
            }

            if (!this.registration) {
                return { subscribed: false, permission: 'default' };
            }

            const subscription = await this.registration.pushManager.getSubscription();
            const permission = Notification.permission;

            return {
                subscribed: !!subscription,
                permission,
                subscription
            };
        } catch (error) {
            console.error('Error getting subscription status:', error);
            return { subscribed: false, permission: 'default' };
        }
    }

    // Diagnostic method for debugging push notification issues
    async diagnose() {
        console.log('=== Push Notification Diagnostics ===');
        
        // Check browser support
        const support = this.isSupported();
        console.log('Browser support:', support);
        
        // Check environment
        console.log('Environment:', {
            protocol: location.protocol,
            hostname: location.hostname,
            isSecureContext: window.isSecureContext,
            userAgent: navigator.userAgent
        });
        
        // Check VAPID key
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        console.log('VAPID key configured:', !!publicKey);
        if (publicKey) {
            console.log('VAPID key length:', publicKey.length);
        }
        
        // Check service worker
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            console.log('Service worker registration:', !!registration);
            if (registration) {
                console.log('SW active:', !!registration.active);
                console.log('SW state:', registration.active?.state);
                console.log('SW scope:', registration.scope);
                console.log('PushManager available:', !!registration.pushManager);
            }
        } catch (error) {
            console.log('Service worker error:', error);
        }
        
        // Check permissions
        console.log('Notification permission:', Notification.permission);
        
        // Check existing subscription
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration?.pushManager) {
                const existingSub = await registration.pushManager.getSubscription();
                console.log('Existing subscription:', !!existingSub);
                if (existingSub) {
                    console.log('Existing subscription details:', {
                        endpoint: !!existingSub.endpoint,
                        hasKeys: !!existingSub.keys,
                        hasP256dh: !!existingSub.keys?.p256dh,
                        hasAuth: !!existingSub.keys?.auth
                    });
                }
            }
        } catch (error) {
            console.log('Subscription check error:', error);
        }
        
        console.log('=== End Diagnostics ===');
    }
}

export default new PushNotificationManager();