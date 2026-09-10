import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

let wasmPlugin: any = null;
let topLevelAwaitPlugin: any = null;

try {
  const wasmModule = await import('vite-plugin-wasm');
  wasmPlugin = wasmModule.default;
} catch (e) {
  console.warn('⚠️ vite-plugin-wasm не загружен');
}

try {
  const tlaModule = await import('vite-plugin-top-level-await');
  topLevelAwaitPlugin = tlaModule.default;
} catch (e) {
  console.warn('⚠️ vite-plugin-top-level-await не загружен');
}

export default defineConfig({
  base: './',
  plugins: [
    react(),
    wasmPlugin && wasmPlugin(),
    topLevelAwaitPlugin && topLevelAwaitPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ⚠️ ГЛАВНОЕ: указываем конкретные CJS-файлы
      'react': path.resolve(__dirname, './node_modules/react/cjs/react.production.min.js'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom/cjs/react-dom.production.min.js'),
      'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/cjs/react-jsx-runtime.production.min.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/cjs/react-jsx-dev-runtime.production.min.js'),
    },
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
    include: ['react', 'react-dom', 'react-router-dom', 'react/jsx-runtime'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
});
