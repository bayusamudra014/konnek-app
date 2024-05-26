/** @type {import('next').NextConfig} */
import nextPWA from 'next-pwa';

const isDev = process.env.NODE_ENV !== "production";

const withPWA = nextPWA({
  dest: 'public',
  offlineGoogleAnalytics: true,
  exclude: [
    // add buildExcludes here
    ({ asset }) => {
      if (
        asset.name.startsWith("server/") ||
        asset.name.match(/^((app-|^)build-manifest\.json|react-loadable-manifest\.json)$/)
      ) {
        return true;
      }
      if (isDev && !asset.name.startsWith("static/runtime/")) {
        return true;
      }
      return false;
    }
  ],
});

export default withPWA({
  reactStrictMode: true,
  output: "standalone",
  productionBrowserSourceMaps: false,
  swcMinify: true,
});
