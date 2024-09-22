/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ferrata.dev",
        port: "",
        pathname: "/static/img/**",
      },
    ],
  },
};

export default nextConfig;
