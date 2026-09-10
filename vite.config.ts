import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

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
    inspectAttr(), 
    react(),
    wasmPlugin && wasmPlugin(),
    topLevelAwaitPlugin && topLevelAwaitPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      'cookie',
      'lucide-react',
    ],
    exclude: ['onnxruntime-web'],
  },
  build: {
    commonjsOptions: {
      include: [
        /onnxruntime-web/,
        /@imgly\/background-removal/,
        /react-router/,
        /cookie/,
        /lucide-react/,
      ],
      transformMixedEsModules: true,
    },
  },
});
