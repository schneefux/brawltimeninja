import { useMeta } from "./compat";

declare global {
  interface Window {
    adsbygoogle: {
      push: (args: any) => void;
      pauseAdRequests: number;
    };
  }
}
export function useAdsense(publisherId: string) {
  useMeta(() => ({
    script: [
      {
        key: 'adsense',
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`,
        async: true,
        crossorigin: 'anonymous',
      },
    ],
  }))
}
