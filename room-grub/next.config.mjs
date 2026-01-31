import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Allow Google profile images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Tree-shake MUI and date-fns imports
  modularizeImports: {
    '@mui/joy': {
      transform: '@mui/joy/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },
  experimental: {
    optimizePackageImports: ['@mui/joy', '@mui/material', '@mui/icons-material', 'date-fns'],
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
    ],
    // Use custom service worker source with InjectManifest
    // This prevents auto-formatting from removing push notification handlers
    workboxOptions: {
        swSrc: 'src/sw.js',
        swDest: 'public/sw.js',
        mode: 'production',
        exclude: [
            /\.map$/,
            /manifest$/,
            /\.json$/,
            /^manifest.*\.js$/,
        ],
        // Increase size limit for large MUI chunks
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
    }
})(nextConfig); 