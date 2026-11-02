import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local forms retain their same-origin referrer. Keep Vinext's default
  // origin protection; localhost and 127.0.0.1 work on any port.
};

export default nextConfig;
