import { useMeta } from "./compat";

declare global {
  interface Window {
    __vm_add: HTMLElement[];
    __vm_remove: HTMLElement[];
    __vm_remove_category: string[];
  }
}

export function useVenatus(siteId: string) {
  useMeta(() => ({
    script: [ {
      key: 'venatus',
      src: `https://hb.vntsm.com/v3/live/ad-manager.min.js`,
      'data-site-id': siteId,
      'data-mode': 'scan',
      async: true,
      tagPriority: 31,
    } ],
  }))
}
