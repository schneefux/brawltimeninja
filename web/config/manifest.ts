import { ManifestOptions } from "vite-plugin-pwa";
import { themeColor } from "../theme-colors.config.js";

export default {
  id: '/?standalone=true',
  start_url: '/?standalone=true',
  name: 'Brawl Time Ninja',
  short_name: 'Brawl Time',
  description: 'Track Brawl Stars stats, hours played and view Tier Lists.',
  theme_color: themeColor,
  icons: [
  // opaque background, centered
  {
    'src': '/icons/maskable_icon_x48.png',
    'sizes': '48x48',
    'type': 'image/png',
    'purpose': 'maskable'
  }, {
    'src': '/icons/maskable_icon_x72.png',
    'sizes': '72x72',
    'type': 'image/png',
    'purpose': 'maskable'
  },
  {
    'src': '/icons/maskable_icon_x96.png',
    'sizes': '96x96',
    'type': 'image/png',
    'purpose': 'maskable'
  },
  {
    'src': '/icons/maskable_icon_x128.png',
    'sizes': '128x128',
    'type': 'image/png',
    'purpose': 'maskable'
  },
  {
    'src': '/icons/maskable_icon_x192.png',
    'sizes': '192x192',
    'type': 'image/png',
    'purpose': 'maskable'
  },
  {
    'src': '/icons/maskable_icon_x384.png',
    'sizes': '384x384',
    'type': 'image/png',
    'purpose': 'maskable'
  },
  {
    'src': '/icons/maskable_icon_x512.png',
    'sizes': '512x512',
    'type': 'image/png',
    'purpose': 'maskable'
  },
  // transparent background
  {
    'src': '/icons/icon_x48.png',
    'sizes': '48x48',
    'type': 'image/png',
    'purpose': 'any'
  }, {
    'src': '/icons/icon_x72.png',
    'sizes': '72x72',
    'type': 'image/png',
    'purpose': 'any'
  },
  {
    'src': '/icons/icon_x96.png',
    'sizes': '96x96',
    'type': 'image/png',
    'purpose': 'any'
  },
  {
    'src': '/icons/icon_x128.png',
    'sizes': '128x128',
    'type': 'image/png',
    'purpose': 'any'
  },
  {
    'src': '/icons/icon_x192.png',
    'sizes': '192x192',
    'type': 'image/png',
    'purpose': 'any'
  },
  {
    'src': '/icons/icon_x384.png',
    'sizes': '384x384',
    'type': 'image/png',
    'purpose': 'any'
  },
  {
    'src': '/icons/icon_x512.png',
    'sizes': '512x512',
    'type': 'image/png',
    'purpose': 'any'
  }],
} satisfies Partial<ManifestOptions>
