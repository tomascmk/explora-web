import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Evita el warning de múltiples lockfiles y errores en next start
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
