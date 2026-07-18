'use client';

import { GoogleLogin } from '@react-oauth/google';

// FedCM Button Flow needs Chrome 125+ desktop / 128+ Android.
// Chrome 117–127 has the FedCM API but not button mode; passing
// use_fedcm_for_button there prevents the button from rendering at all.
function fedcmButtonSupported() {
    if (typeof window === 'undefined' || !('IdentityCredential' in window)) return false;
    const match = navigator.userAgent.match(/Chrome\/(\d+)/);
    if (!match) return false;
    const version = Number(match[1]);
    return /Android/.test(navigator.userAgent) ? version >= 128 : version >= 125;
}

export default function GoogleLoginButton({ onSuccess, onError }) {
    return (
        <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            useOneTap
            use_fedcm_for_prompt
            {...(fedcmButtonSupported() ? { use_fedcm_for_button: true } : {})}
            itp_support
            auto_select={false}
            cancel_on_tap_outside={false}
            theme="outline"
            shape="pill"
            size="large"
            text="signin_with"
        />
    );
}
