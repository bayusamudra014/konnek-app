/** @type {import('next').NextConfig} */
import nextPWA from 'next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  offlineGoogleAnalytics: true,
});

export default withPWA({
  reactStrictMode: true,
  output: "standalone",
  productionBrowserSourceMaps: false,
  swcMinify: true,
});
