import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize OpenNext Cloudflare for development
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Configure the base path and asset prefix to reflect the mount path of your environment
  // For example, if your app is mounted at /dashboard, set basePath and assetPrefix to '/dashboard'
  basePath: '/dashboard',
  assetPrefix: '/dashboard',
  images: {
    // TODO: determine whether any of the non-custom loader options (imgix, cloudinary, akamai) work
    // and if so allow them to be used here
    loader: 'custom',
    loaderFile: './webflow-loader.ts',
  },
};

export default nextConfig;
