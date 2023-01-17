import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  optimizeDeps: {
    exclude: ['vue'],
  },
  build: {
    sourcemap: true,
    lib: {
      entry: resolve('./components/index.ts'),
      name: 'Klicker',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          'vue': 'Vue',
        },
      },
    },
  },
})
