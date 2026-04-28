import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deshabilitar source maps en el browser en producción para no exponer código del servidor
  productionBrowserSourceMaps: false,
  // Permitir acceso cross-origin desde GitHub Codespaces en desarrollo
  allowedDevOrigins: ["*.app.github.dev"],
};

export default nextConfig;
