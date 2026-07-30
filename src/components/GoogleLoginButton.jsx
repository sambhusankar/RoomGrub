'use client';

import { GoogleLogin } from '@react-oauth/google';

// initialize() and renderButton() run in the same synchronous GIS call, so any
// unsupported FedCM flag passed to initialize() can prevent the button from
// rendering at all, not just break the flag's own feature.
function fedcmSupported() {
    return typeof window !== 'undefined' && 'IdentityCredential' in window;
}

// FedCM Button Flow needs Chrome 125+ desktop / 128+ Android.
// Chrome 117–127 has the FedCM API but not button mode; passing
// use_fedcm_for_button there prevents the button from rendering at all.
function fedcmButtonSupported() {
    if (!fedcmSupported()) return false;
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
            {...(fedcmSupported() ? { use_fedcm_for_prompt: true } : {})}
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
