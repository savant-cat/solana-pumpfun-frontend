/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['ipfs.io', 'scarlet-extra-cat-880.mypinata.cloud'], // Merge both domains into one array
  },
};

export default nextConfig;
