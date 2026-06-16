/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir : 'build',
    reactStrictMode: false,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
        ],
    },
};

export default nextConfig;
