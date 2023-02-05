import { useMeta } from "./compat";

export function useAdsense(publisherId: string) {
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
        async: false,
      },
    ],
  }))
}
