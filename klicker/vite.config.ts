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
    exclude: ['@vue/composition-api'],
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
      external: ['vue', '@vue/composition-api', /\@nuxtjs\/composition-api/, 'vue-router'],
      output: {
        globals: {
          'vue': 'Vue',
          '@vue/composition-api': 'VueCompositionApi',
          '@nuxtjs/composition-api': 'NuxtJSCompositionApi',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
})
