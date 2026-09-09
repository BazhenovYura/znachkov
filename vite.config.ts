import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// Пытаемся импортировать WASM плагины, но если их нет — пропускаем
let wasmPlugin: any = null;
let topLevelAwaitPlugin: any = null;

try {
  // Динамический импорт для избежания ошибок при сборке
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

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    inspectAttr(), 
    react(),
    wasmPlugin && wasmPlugin(),
    topLevelAwaitPlugin && topLevelAwaitPlugin(),
  ].filter(Boolean), // Убираем null/undefined плагины
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ПРИНУДИТЕЛЬНО УКАЗЫВАЕМ React — ЭТО РЕШАЕТ ПРОБЛЕМУ С forwardRef
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'], // ДОБАВЛЯЕМ include
    exclude: ['onnxruntime-web'],
  },
  build: {
    commonjsOptions: {
      include: [/onnxruntime-web/, /@imgly\/background-removal/],
    },
    // ДОБАВЛЯЕМ НАСТРОЙКУ ДЛЯ lucide-react
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'lucide-react': ['lucide-react'],
        },
      },
    },
  },
});
