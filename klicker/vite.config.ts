import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['vue'],
  },
  build: {
    sourcemap: true,
    lib: {
      entry: {
        index: resolve('./index.ts'),
        // TODO set up package exports so that these actually get used
        components: resolve('./components/index.ts'),
        composables: resolve('./composables/index.ts'),
        ml: resolve('./ml/index.ts'),
        visualisations: resolve('./visualisations.ts'),
        service: resolve('./service.ts'),
        props: resolve('./props.ts'),
      },
      name: 'Klicker',
      fileName: (format, entryName) => `${entryName}.${format}.js`,
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
