import { useMeta } from "./compat";

declare global {
  interface Window {
    __vm_add: HTMLElement[];
    __vm_remove: HTMLElement[];
    __vm_remove_category: string[];
  }
}

export function useVenatus() {
  useMeta(() => ({
    script: [ {
      key: 'venatus',
      src: `https://hb.vntsm.com/v4/live/vms/sites/brawltime.ninja/index.js`,
      async: true,
      tagPriority: 31,
    } ],
  }))
}
