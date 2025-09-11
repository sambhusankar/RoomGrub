import { SwapCalls } from '@mui/icons-material';
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default withPWA({
    dest: 'public',
    register: true,
    disable: false,
    skipWaiting: true,
    buildExcludes: [/app-build-manifest\.json$/],
    exclude: [
      // Exclude problematic Next.js internal files
      ({ asset, compilation }) => {
        if (
          asset.name.startsWith('server/') ||
          asset.name.match(/^((app-|^)build-manifest\.json|react-loadable-manifest\.json)$/)
        ) {
          return true
        }
        if (process.env.NODE_ENV === 'development' && !asset.name.startsWith('static/runtime/')) {
          return true
        }
        return false
      }
    ]
})(nextConfig); 