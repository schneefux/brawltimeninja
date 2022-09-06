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
    visualizer() as any, // TODO https://github.com/btd/rollup-plugin-visualizer/issues/124
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
      external: ['vue', /\@nuxtjs\/composition-api/, 'vue-router'],
      output: {
        globals: {
          'vue': 'Vue',
          '@nuxtjs/composition-api': 'NuxtJSCompositionApi',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
})
