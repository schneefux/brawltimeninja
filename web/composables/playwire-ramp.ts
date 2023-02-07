import { useRoute } from "vue-router";
import { watch } from "vue"
import { useMeta } from "./compat";

export type TaggedType = 'leaderboard_atf' | 'leaderboard_btf' | 'med_rect_atf' | 'med_rect_btf' | 'sky_atf' | 'sky_btf'
const taglessTypes = ['trendi_slideshow', 'trendi_video', 'site_skin', 'flex_leaderboard', 'top_rail', 'right_rail', 'bottom_rail', 'left_rail'] as const
export type TaglessType = typeof taglessTypes[number]

interface TaggedUnit {
  type: TaggedType
  selectorId: string
}

interface TaglessUnit {
  type: TaglessType
}

type Unit = TaggedUnit | TaglessUnit

declare global {
  interface Window {
    ramp: {
      passiveMode: boolean;
      addUnits: (units: Unit[]) => Promise<void>;
      settings: Record<string, any>;
      displayUnits: () => void;
      getUnits: () => Unit[];
      destroyUnits: (units: 'all'|string|string[]) => Promise<void>;
      setPath: (path?: string) => void;
      triggerRefresh: () => void;
      showCmpModal: () => void;
      onReady: (callback: () => void) => void;
      onPlayerReady: (callback: () => void) => void;
      que: (() => void)[];
    };
  }
}

export function usePlaywireRamp(publisherId: string, siteId: string, playwireRampGa4Id: string) {
  const outOfPageUnits = taglessTypes.map(unit => ({ type: unit }))

  const route = useRoute()

  watch(route, () => {
    window.ramp.setPath(route.path)
  }, { flush: 'post' })

  useMeta(() => ({
    script: [ {
      key: 'playwire-ramp',
      src: `//cdn.intergient.com/${publisherId}/${siteId}/ramp.js`,
      async: true,
    }, {
      key: 'playwire-ramp-init',
      innerHTML:
`window.ramp = window.ramp || {};
window.ramp.que = window.ramp.que || [];
window.ramp.passiveMode = true;

window.ramp.que.push(() => {
  window.ramp
    .addUnits(${JSON.stringify(outOfPageUnits)})
    .finally(() => window.ramp.displayUnits())
});`
    }, {
      key: 'playwire-ramp-ga4',
      innerHTML:
`window._pwGA4PageviewId = ''.concat(Date.now());
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () {
  dataLayer.push(arguments);
};
gtag('js', new Date());
gtag('config', '${playwireRampGa4Id}', { 'send_page_view': false });
gtag(
  'event',
  'ramp_js',
  {
    'send_to': '${playwireRampGa4Id}',
    'pageview_id': window._pwGA4PageviewId
  }
);`
    } ],
  }))
}
