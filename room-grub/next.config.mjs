import { SwapCalls } from '@mui/icons-material';
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default withPWA({
    dest: 'public',
    register: true,
    disable: false, // Enable PWA in development for testing notifications
    skipWaiting: true,
})(nextConfig); 