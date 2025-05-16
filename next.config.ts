import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...(config.module?.rules || []),
          {
            test: /\.cdc$/,
            use: 'raw-loader',
          },
        ],
      },
    }
  }
};

export default nextConfig;
