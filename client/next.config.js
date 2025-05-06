const withPWA = require('next-pwa');

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pm-s3-images.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "/**",
      }
    ]
  }
});

module.exports = config; 