import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig = {
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["next-safe"],
};

export default withMDX(nextConfig);
