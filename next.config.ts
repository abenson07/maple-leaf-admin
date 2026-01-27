import type { NextConfig } from "next";
import userConfig from './clouduser.next.config';

const webflowOverrides: NextConfig = {
  basePath: '/dashboard',
  assetPrefix: 'https://3b988a53-872d-46e0-9bf4-cbeae5d71ad9.wf-app-prod.cosmic.webflow.services/dashboard',
  images: {
    ...userConfig.images,
    // TODO: determine whether any of the non-custom loader options (imgix, cloudinary, akamai) work
    // and if so allow them to be used here
    loader: 'custom',
    loaderFile: userConfig.images?.loaderFile || './webflow-loader.ts',
  },
};

const nextConfig: NextConfig = {
  ...userConfig,
  ...webflowOverrides,
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
