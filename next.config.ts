import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    // Temporal -> Use Backend
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },

};

export default nextConfig;
