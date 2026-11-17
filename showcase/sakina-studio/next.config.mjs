/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/art-de-la-difference/sakina-studio",
  trailingSlash: true,
  images: { unoptimized: true },
  // for plain <a> tags (src/utils/withBase.js): unlike next/link they do not add the basePath
  env: { NEXT_PUBLIC_BASE_PATH: "/art-de-la-difference/sakina-studio" },
};

export default nextConfig;
