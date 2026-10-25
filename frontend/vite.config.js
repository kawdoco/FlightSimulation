import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: [{ find: /^three$/, replacement: fileURLToPath(new URL('./node_modules/three/src/Three.js', import.meta.url)) }] },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep the public re-export modules outside shared chunks. Splitting them
          // with their dependencies creates circular chunks and unsafe init order.
          if (id.includes('/three/src/')) {
            if (/\/Three(\.Core)?\.js$/.test(id)) return;
            const renderer = id.includes('/renderers/webgl/') || id.includes('/renderers/webxr/') || id.endsWith('/WebGLRenderer.js');
            const shader = id.includes('/renderers/shaders/') && !/\/(UniformsUtils|default_vertex\.glsl|default_fragment\.glsl)\.js$/.test(id);
            if (renderer || shader) return 'three-renderer';
            if (id.includes('/math/') || id.endsWith('/constants.js') || id.endsWith('/utils.js')) return 'three-math';
            return 'three-core';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
