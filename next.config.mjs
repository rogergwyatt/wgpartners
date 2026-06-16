/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir : 'build',
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
        ],
    },
};

export default nextConfig;
