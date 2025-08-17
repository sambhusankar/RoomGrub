import { SwapCalls } from '@mui/icons-material';
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default withPWA({
    dest: 'public',
    register: true,
    disable: process.env.NODE_ENV === 'development',
    skipWaiting: true,
})(nextConfig); 