export const PLAY_STORE_PACKAGE = 'broccly.roomgrub.twa';

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`;

// Play Console reads the `referrer` param, so banner installs can be tracked separately.
export const PLAY_STORE_BANNER_URL = `${PLAY_STORE_URL}&referrer=utm_source%3Dweb_banner`;
