import { resolve } from 'path'
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { visualizer } from 'rollup-plugin-visualizer'

// TODO: Create a Vue 3 build

export default defineConfig({
  plugins: [
    createVuePlugin({
      jsx: true,
    }),
    visualizer(),
  ],
  optimizeDeps: {
    exclude: ['vue-demi'],
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
      external: ['vue', 'vue-demi', /\@nuxtjs\/composition-api/],
      output: {
        globals: {
          'vue': 'Vue',
          'vue-demi': 'VueDemi',
          '@nuxtjs/composition-api': 'NuxtJSCompositionApi',
        },
      },
    },
  },
})
