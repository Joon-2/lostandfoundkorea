/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/pay/all-in-one",
        destination: "/report?plan=all_in_one",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
