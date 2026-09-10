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
    },
    // ⚠️ ДОБАВЛЕНО: Форсируем использование CJS-версий, которые Rollup сможет обработать
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
    // ⚠️ ДОБАВЛЕНО: Форсируем предобработку React
    include: ['react', 'react-dom', 'react-router-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  build: {
    commonjsOptions: {
      // ⚠️ ДОБАВЛЕНО: Явно указываем, какие модули конвертировать
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // ⚠️ ДОБАВЛЕНО: Помогаем Rollup найти правильные экспорты
      treeshake: {
        moduleSideEffects: 'no-external',
      },
    },
  },
});
