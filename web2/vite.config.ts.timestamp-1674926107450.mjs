// vite.config.ts
import vue from "file:///Users/timo/projekte/brawltimeninja/web2/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import ssr from "file:///Users/timo/projekte/brawltimeninja/web2/node_modules/vite-plugin-ssr/dist/cjs/node/plugin/index.js";
import Components from "file:///Users/timo/projekte/brawltimeninja/web2/node_modules/unplugin-vue-components/dist/vite.mjs";
import UnheadVite from "file:///Users/timo/projekte/brawltimeninja/web2/node_modules/@unhead/addons/dist/vite.mjs";
import path from "path";
import { visualizer } from "file:///Users/timo/projekte/brawltimeninja/web2/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { VitePWA } from "file:///Users/timo/projekte/brawltimeninja/web2/node_modules/vite-plugin-pwa/dist/index.mjs";
import Pages from "file:///Users/timo/projekte/brawltimeninja/web2/node_modules/vite-plugin-pages/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/timo/projekte/brawltimeninja/web2";
var config = {
  plugins: [
    Components({
      dirs: "./components",
      dts: true
    }),
    vue(),
    Pages({
      dirs: "./pages",
      importMode: "async",
      routeStyle: "nuxt",
      resolver: "vue"
    }),
    VitePWA({
      devOptions: {
        enabled: false
      },
      registerType: "autoUpdate",
      manifest: {
        id: "/?standalone=true",
        start_url: "/?standalone=true",
        name: "Brawl Time Ninja",
        short_name: "Brawl Time",
        description: "Track Brawl Stars stats, hours played and view Tier Lists.",
        theme_color: "#facc15",
        // yellow-400
        icons: [
          // opaque background, centered
          {
            "src": "/icons/maskable_icon_x48.png",
            "sizes": "48x48",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/icons/maskable_icon_x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/icons/maskable_icon_x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/icons/maskable_icon_x128.png",
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/icons/maskable_icon_x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/icons/maskable_icon_x384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/icons/maskable_icon_x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          },
          // transparent background
          {
            "src": "/icons/icon_x48.png",
            "sizes": "48x48",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/icons/icon_x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/icons/icon_x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/icons/icon_x128.png",
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/icons/icon_x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/icons/icon_x384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/icons/icon_x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          }
        ]
      },
      workbox: {
        // exclude HTML https://github.com/vite-pwa/vite-plugin-pwa/issues/120#issuecomment-1202579983
        //globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,webp,woff,woff2,ttf,otf,ico}'],
        //globIgnores: ['**/*.html'],
        globIgnores: ["**/*"],
        navigateFallback: null,
        // FIXME depends on env variables being available at build time
        // - use *.brawltime.ninja as urlPattern instead
        runtimeCaching: [{
          urlPattern: process.env.MEDIA_URL + "/.*",
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "media",
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 31
            }
          }
        }, {
          urlPattern: process.env.CUBE_URL + "/.*",
          handler: "NetworkFirst",
          options: {
            cacheName: "cube",
            expiration: {
              maxAgeSeconds: 60 * 60
            }
          }
        }, {
          urlPattern: process.env.MANAGER_URL + "/.*",
          handler: "NetworkFirst",
          options: {
            cacheName: "manager",
            expiration: {
              maxAgeSeconds: 60 * 60 * 24
            }
          }
        }]
      }
    }),
    UnheadVite(),
    ssr(),
    visualizer()
  ],
  assetsInclude: ["assets/content/**/*.md"],
  optimizeDeps: {
    include: ["@schneefux/klicker"],
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/@schneefux\/klicker/, /node_modules/]
    }
  },
  resolve: {
    dedupe: ["vue", "vue3-lazy-hydration"],
    // https://github.com/vitejs/vite/issues/7454#issuecomment-1079830994
    alias: {
      "~": path.resolve(__vite_injected_original_dirname),
      "@": path.resolve(__vite_injected_original_dirname),
      "sampson": path.resolve("node_modules/sampson/dist/lib.es6.js")
    }
  }
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdGltby9wcm9qZWt0ZS9icmF3bHRpbWVuaW5qYS93ZWIyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvdGltby9wcm9qZWt0ZS9icmF3bHRpbWVuaW5qYS93ZWIyL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy90aW1vL3Byb2pla3RlL2JyYXdsdGltZW5pbmphL3dlYjIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCBzc3IgZnJvbSAndml0ZS1wbHVnaW4tc3NyL3BsdWdpbidcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXG5pbXBvcnQgVW5oZWFkVml0ZSBmcm9tICdAdW5oZWFkL2FkZG9ucy92aXRlJ1xuaW1wb3J0IHsgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcidcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5pbXBvcnQgUGFnZXMgZnJvbSAndml0ZS1wbHVnaW4tcGFnZXMnXG5cbmNvbnN0IGNvbmZpZzogVXNlckNvbmZpZyA9IHtcbiAgcGx1Z2luczogW1xuICAgIENvbXBvbmVudHMoe1xuICAgICAgZGlyczogJy4vY29tcG9uZW50cycsXG4gICAgICBkdHM6IHRydWUsXG4gICAgfSksXG4gICAgdnVlKCksXG4gICAgUGFnZXMoe1xuICAgICAgZGlyczogJy4vcGFnZXMnLFxuICAgICAgaW1wb3J0TW9kZTogJ2FzeW5jJyxcbiAgICAgIHJvdXRlU3R5bGU6ICdudXh0JyxcbiAgICAgIHJlc29sdmVyOiAndnVlJyxcbiAgICB9KSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIGRldk9wdGlvbnM6IHtcbiAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICB9LFxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBpZDogJy8/c3RhbmRhbG9uZT10cnVlJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLz9zdGFuZGFsb25lPXRydWUnLFxuICAgICAgICBuYW1lOiAnQnJhd2wgVGltZSBOaW5qYScsXG4gICAgICAgIHNob3J0X25hbWU6ICdCcmF3bCBUaW1lJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUcmFjayBCcmF3bCBTdGFycyBzdGF0cywgaG91cnMgcGxheWVkIGFuZCB2aWV3IFRpZXIgTGlzdHMuJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjZmFjYzE1JywgLy8geWVsbG93LTQwMFxuICAgICAgICBpY29uczogW1xuICAgICAgICAvLyBvcGFxdWUgYmFja2dyb3VuZCwgY2VudGVyZWRcbiAgICAgICAge1xuICAgICAgICAgICdzcmMnOiAnL2ljb25zL21hc2thYmxlX2ljb25feDQ4LnBuZycsXG4gICAgICAgICAgJ3NpemVzJzogJzQ4eDQ4JyxcbiAgICAgICAgICAndHlwZSc6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICdwdXJwb3NlJzogJ21hc2thYmxlJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgJ3NyYyc6ICcvaWNvbnMvbWFza2FibGVfaWNvbl94NzIucG5nJyxcbiAgICAgICAgICAnc2l6ZXMnOiAnNzJ4NzInLFxuICAgICAgICAgICd0eXBlJzogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgJ3B1cnBvc2UnOiAnbWFza2FibGUnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAnc3JjJzogJy9pY29ucy9tYXNrYWJsZV9pY29uX3g5Ni5wbmcnLFxuICAgICAgICAgICdzaXplcyc6ICc5Nng5NicsXG4gICAgICAgICAgJ3R5cGUnOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAncHVycG9zZSc6ICdtYXNrYWJsZSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICdzcmMnOiAnL2ljb25zL21hc2thYmxlX2ljb25feDEyOC5wbmcnLFxuICAgICAgICAgICdzaXplcyc6ICcxMjh4MTI4JyxcbiAgICAgICAgICAndHlwZSc6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICdwdXJwb3NlJzogJ21hc2thYmxlJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgJ3NyYyc6ICcvaWNvbnMvbWFza2FibGVfaWNvbl94MTkyLnBuZycsXG4gICAgICAgICAgJ3NpemVzJzogJzE5MngxOTInLFxuICAgICAgICAgICd0eXBlJzogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgJ3B1cnBvc2UnOiAnbWFza2FibGUnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAnc3JjJzogJy9pY29ucy9tYXNrYWJsZV9pY29uX3gzODQucG5nJyxcbiAgICAgICAgICAnc2l6ZXMnOiAnMzg0eDM4NCcsXG4gICAgICAgICAgJ3R5cGUnOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAncHVycG9zZSc6ICdtYXNrYWJsZSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICdzcmMnOiAnL2ljb25zL21hc2thYmxlX2ljb25feDUxMi5wbmcnLFxuICAgICAgICAgICdzaXplcyc6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAndHlwZSc6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICdwdXJwb3NlJzogJ21hc2thYmxlJ1xuICAgICAgICB9LFxuICAgICAgICAvLyB0cmFuc3BhcmVudCBiYWNrZ3JvdW5kXG4gICAgICAgIHtcbiAgICAgICAgICAnc3JjJzogJy9pY29ucy9pY29uX3g0OC5wbmcnLFxuICAgICAgICAgICdzaXplcyc6ICc0OHg0OCcsXG4gICAgICAgICAgJ3R5cGUnOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAncHVycG9zZSc6ICdhbnknXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAnc3JjJzogJy9pY29ucy9pY29uX3g3Mi5wbmcnLFxuICAgICAgICAgICdzaXplcyc6ICc3Mng3MicsXG4gICAgICAgICAgJ3R5cGUnOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAncHVycG9zZSc6ICdhbnknXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAnc3JjJzogJy9pY29ucy9pY29uX3g5Ni5wbmcnLFxuICAgICAgICAgICdzaXplcyc6ICc5Nng5NicsXG4gICAgICAgICAgJ3R5cGUnOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAncHVycG9zZSc6ICdhbnknXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAnc3JjJzogJy9pY29ucy9pY29uX3gxMjgucG5nJyxcbiAgICAgICAgICAnc2l6ZXMnOiAnMTI4eDEyOCcsXG4gICAgICAgICAgJ3R5cGUnOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAncHVycG9zZSc6ICdhbnknXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAnc3JjJzogJy9pY29ucy9pY29uX3gxOTIucG5nJyxcbiAgICAgICAgICAnc2l6ZXMnOiAnMTkyeDE5MicsXG4gICAgICAgICAgJ3R5cGUnOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAncHVycG9zZSc6ICdhbnknXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAnc3JjJzogJy9pY29ucy9pY29uX3gzODQucG5nJyxcbiAgICAgICAgICAnc2l6ZXMnOiAnMzg0eDM4NCcsXG4gICAgICAgICAgJ3R5cGUnOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAncHVycG9zZSc6ICdhbnknXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAnc3JjJzogJy9pY29ucy9pY29uX3g1MTIucG5nJyxcbiAgICAgICAgICAnc2l6ZXMnOiAnNTEyeDUxMicsXG4gICAgICAgICAgJ3R5cGUnOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAncHVycG9zZSc6ICdhbnknXG4gICAgICAgIH1dLFxuICAgICAgfSxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgLy8gZXhjbHVkZSBIVE1MIGh0dHBzOi8vZ2l0aHViLmNvbS92aXRlLXB3YS92aXRlLXBsdWdpbi1wd2EvaXNzdWVzLzEyMCNpc3N1ZWNvbW1lbnQtMTIwMjU3OTk4M1xuICAgICAgICAvL2dsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3Msc3ZnLHBuZyxqcGcsanBlZyx3ZWJwLHdvZmYsd29mZjIsdHRmLG90ZixpY299J10sXG4gICAgICAgIC8vZ2xvYklnbm9yZXM6IFsnKiovKi5odG1sJ10sXG4gICAgICAgIGdsb2JJZ25vcmVzOiBbJyoqLyonXSxcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFjazogbnVsbCxcbiAgICAgICAgLy8gRklYTUUgZGVwZW5kcyBvbiBlbnYgdmFyaWFibGVzIGJlaW5nIGF2YWlsYWJsZSBhdCBidWlsZCB0aW1lXG4gICAgICAgIC8vIC0gdXNlICouYnJhd2x0aW1lLm5pbmphIGFzIHVybFBhdHRlcm4gaW5zdGVhZFxuICAgICAgICBydW50aW1lQ2FjaGluZzogW3tcbiAgICAgICAgICB1cmxQYXR0ZXJuOiBwcm9jZXNzLmVudi5NRURJQV9VUkwgKyAnLy4qJyxcbiAgICAgICAgICBoYW5kbGVyOiAnU3RhbGVXaGlsZVJldmFsaWRhdGUnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNhY2hlTmFtZTogJ21lZGlhJyxcbiAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB1cmxQYXR0ZXJuOiBwcm9jZXNzLmVudi5DVUJFX1VSTCArICcvLionLFxuICAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNhY2hlTmFtZTogJ2N1YmUnLFxuICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdXJsUGF0dGVybjogcHJvY2Vzcy5lbnYuTUFOQUdFUl9VUkwgKyAnLy4qJyxcbiAgICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBjYWNoZU5hbWU6ICdtYW5hZ2VyJyxcbiAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgVW5oZWFkVml0ZSgpLFxuICAgIHNzcigpLFxuICAgIHZpc3VhbGl6ZXIoKSxcbiAgXSxcbiAgYXNzZXRzSW5jbHVkZTogWydhc3NldHMvY29udGVudC8qKi8qLm1kJ10sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsnQHNjaG5lZWZ1eC9rbGlja2VyJ10sXG4gICAgZXhjbHVkZTogW10sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICBpbmNsdWRlOiBbL0BzY2huZWVmdXhcXC9rbGlja2VyLywgL25vZGVfbW9kdWxlcy9dLFxuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBkZWR1cGU6IFsndnVlJywgJ3Z1ZTMtbGF6eS1oeWRyYXRpb24nXSwgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZpdGVqcy92aXRlL2lzc3Vlcy83NDU0I2lzc3VlY29tbWVudC0xMDc5ODMwOTk0XG4gICAgYWxpYXM6IHtcbiAgICAgICd+JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSksXG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUpLFxuICAgICAgJ3NhbXBzb24nOiBwYXRoLnJlc29sdmUoJ25vZGVfbW9kdWxlcy9zYW1wc29uL2Rpc3QvbGliLmVzNi5qcycpLFxuICAgIH0sXG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZ1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUyxPQUFPLFNBQVM7QUFDMVQsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBRXZCLE9BQU8sVUFBVTtBQUNqQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxXQUFXO0FBUmxCLElBQU0sbUNBQW1DO0FBVXpDLElBQU0sU0FBcUI7QUFBQSxFQUN6QixTQUFTO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVCxNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsSUFDRCxJQUFJO0FBQUEsSUFDSixNQUFNO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixZQUFZO0FBQUEsTUFDWixVQUFVO0FBQUEsSUFDWixDQUFDO0FBQUEsSUFDRCxRQUFRO0FBQUEsTUFDTixZQUFZO0FBQUEsUUFDVixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsY0FBYztBQUFBLE1BQ2QsVUFBVTtBQUFBLFFBQ1IsSUFBSTtBQUFBLFFBQ0osV0FBVztBQUFBLFFBQ1gsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBO0FBQUEsUUFDYixPQUFPO0FBQUE7QUFBQSxVQUVQO0FBQUEsWUFDRSxPQUFPO0FBQUEsWUFDUCxTQUFTO0FBQUEsWUFDVCxRQUFRO0FBQUEsWUFDUixXQUFXO0FBQUEsVUFDYjtBQUFBLFVBQUc7QUFBQSxZQUNELE9BQU87QUFBQSxZQUNQLFNBQVM7QUFBQSxZQUNULFFBQVE7QUFBQSxZQUNSLFdBQVc7QUFBQSxVQUNiO0FBQUEsVUFDQTtBQUFBLFlBQ0UsT0FBTztBQUFBLFlBQ1AsU0FBUztBQUFBLFlBQ1QsUUFBUTtBQUFBLFlBQ1IsV0FBVztBQUFBLFVBQ2I7QUFBQSxVQUNBO0FBQUEsWUFDRSxPQUFPO0FBQUEsWUFDUCxTQUFTO0FBQUEsWUFDVCxRQUFRO0FBQUEsWUFDUixXQUFXO0FBQUEsVUFDYjtBQUFBLFVBQ0E7QUFBQSxZQUNFLE9BQU87QUFBQSxZQUNQLFNBQVM7QUFBQSxZQUNULFFBQVE7QUFBQSxZQUNSLFdBQVc7QUFBQSxVQUNiO0FBQUEsVUFDQTtBQUFBLFlBQ0UsT0FBTztBQUFBLFlBQ1AsU0FBUztBQUFBLFlBQ1QsUUFBUTtBQUFBLFlBQ1IsV0FBVztBQUFBLFVBQ2I7QUFBQSxVQUNBO0FBQUEsWUFDRSxPQUFPO0FBQUEsWUFDUCxTQUFTO0FBQUEsWUFDVCxRQUFRO0FBQUEsWUFDUixXQUFXO0FBQUEsVUFDYjtBQUFBO0FBQUEsVUFFQTtBQUFBLFlBQ0UsT0FBTztBQUFBLFlBQ1AsU0FBUztBQUFBLFlBQ1QsUUFBUTtBQUFBLFlBQ1IsV0FBVztBQUFBLFVBQ2I7QUFBQSxVQUFHO0FBQUEsWUFDRCxPQUFPO0FBQUEsWUFDUCxTQUFTO0FBQUEsWUFDVCxRQUFRO0FBQUEsWUFDUixXQUFXO0FBQUEsVUFDYjtBQUFBLFVBQ0E7QUFBQSxZQUNFLE9BQU87QUFBQSxZQUNQLFNBQVM7QUFBQSxZQUNULFFBQVE7QUFBQSxZQUNSLFdBQVc7QUFBQSxVQUNiO0FBQUEsVUFDQTtBQUFBLFlBQ0UsT0FBTztBQUFBLFlBQ1AsU0FBUztBQUFBLFlBQ1QsUUFBUTtBQUFBLFlBQ1IsV0FBVztBQUFBLFVBQ2I7QUFBQSxVQUNBO0FBQUEsWUFDRSxPQUFPO0FBQUEsWUFDUCxTQUFTO0FBQUEsWUFDVCxRQUFRO0FBQUEsWUFDUixXQUFXO0FBQUEsVUFDYjtBQUFBLFVBQ0E7QUFBQSxZQUNFLE9BQU87QUFBQSxZQUNQLFNBQVM7QUFBQSxZQUNULFFBQVE7QUFBQSxZQUNSLFdBQVc7QUFBQSxVQUNiO0FBQUEsVUFDQTtBQUFBLFlBQ0UsT0FBTztBQUFBLFlBQ1AsU0FBUztBQUFBLFlBQ1QsUUFBUTtBQUFBLFlBQ1IsV0FBVztBQUFBLFVBQ2I7QUFBQSxRQUFDO0FBQUEsTUFDSDtBQUFBLE1BQ0EsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLFFBSVAsYUFBYSxDQUFDLE1BQU07QUFBQSxRQUNwQixrQkFBa0I7QUFBQTtBQUFBO0FBQUEsUUFHbEIsZ0JBQWdCLENBQUM7QUFBQSxVQUNmLFlBQVksUUFBUSxJQUFJLFlBQVk7QUFBQSxVQUNwQyxTQUFTO0FBQUEsVUFDVCxTQUFTO0FBQUEsWUFDUCxXQUFXO0FBQUEsWUFDWCxZQUFZO0FBQUEsY0FDVixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUEsWUFDaEM7QUFBQSxVQUNGO0FBQUEsUUFDRixHQUFHO0FBQUEsVUFDRCxZQUFZLFFBQVEsSUFBSSxXQUFXO0FBQUEsVUFDbkMsU0FBUztBQUFBLFVBQ1QsU0FBUztBQUFBLFlBQ1AsV0FBVztBQUFBLFlBQ1gsWUFBWTtBQUFBLGNBQ1YsZUFBZSxLQUFLO0FBQUEsWUFDdEI7QUFBQSxVQUNGO0FBQUEsUUFDRixHQUFHO0FBQUEsVUFDRCxZQUFZLFFBQVEsSUFBSSxjQUFjO0FBQUEsVUFDdEMsU0FBUztBQUFBLFVBQ1QsU0FBUztBQUFBLFlBQ1AsV0FBVztBQUFBLFlBQ1gsWUFBWTtBQUFBLGNBQ1YsZUFBZSxLQUFLLEtBQUs7QUFBQSxZQUMzQjtBQUFBLFVBQ0Y7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsSUFDWCxJQUFJO0FBQUEsSUFDSixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0EsZUFBZSxDQUFDLHdCQUF3QjtBQUFBLEVBQ3hDLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxvQkFBb0I7QUFBQSxJQUM5QixTQUFTLENBQUM7QUFBQSxFQUNaO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxpQkFBaUI7QUFBQSxNQUNmLFNBQVMsQ0FBQyx1QkFBdUIsY0FBYztBQUFBLElBQ2pEO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsUUFBUSxDQUFDLE9BQU8scUJBQXFCO0FBQUE7QUFBQSxJQUNyQyxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxnQ0FBUztBQUFBLE1BQzNCLEtBQUssS0FBSyxRQUFRLGdDQUFTO0FBQUEsTUFDM0IsV0FBVyxLQUFLLFFBQVEsc0NBQXNDO0FBQUEsSUFDaEU7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHNCQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
