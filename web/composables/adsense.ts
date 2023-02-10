import { usePreferencesStore } from "@/stores/preferences";
import { useMeta } from "./compat";
import { watch } from "vue";

declare global {
  interface Window {
    adsbygoogle: {
      push: (args: any) => void;
      pauseAdRequests: number;
    };
  }
}
export function useAdsense(publisherId: string) {
  const store = usePreferencesStore()

  useMeta(() => ({
    script: [
      {
        key: 'adsense',
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`,
        async: true,
        crossorigin: 'anonymous',
      },
      {
        key: 'adsense-init',
        innerHTML: '(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;',
      },
    ],
    style: [
      !import.meta.env.SSR && store.adsAllowed ? { key: 'hide-adsense', innerHTML: '' } : {
        key: 'hide-adsense',
        innerHTML: '.adswrapper { display: none; }',
      },
    ],
  }))

  const stop = watch(() => store.adsAllowed, (allowed) => {
    if (allowed) {
      window.adsbygoogle.pauseAdRequests = 0
      stop()
    }
  }, {
    immediate: true,
  })
}
