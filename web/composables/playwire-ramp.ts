import { useRoute } from "vue-router";
import { watch } from "vue"
import { useMeta } from "./compat";

export type TaggedType = 'leaderboard_atf' | 'leaderboard_btf' | 'med_rect_atf' | 'med_rect_btf' | 'sky_atf' | 'sky_btf'
export type TaglessType = 'trendi_slideshow' | 'trendi_video' | 'site_skin' | 'flex_leaderboard' | 'top_rail' | 'right_rail' | 'bottom_rail' | 'left_rail'

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
  const outOfPageUnits = ([
    'trendi_slideshow',
    'trendi_video',
    'site_skin',
    'flex_leaderboard',
    'top_rail',
    'right_rail',
    'bottom_rail',
    'left_rail',
  ] satisfies TaglessType[]).map(unit => ({ type: unit }) satisfies TaglessUnit)

  const route = useRoute()

  watch(route, (newRoute, oldRoute) => {
    if (import.meta.env.SSR) {
      return
    }

    window.ramp.setPath(route.fullPath)
    if (oldRoute != undefined) {
      window.ramp.que.push(() => {
        window.ramp.destroyUnits('all')
          .catch(e => console.warn(e))
      })
    }

    window.ramp.que.push(() => {
      window.ramp.addUnits(outOfPageUnits)
        .catch(e => console.warn(e))
        .finally(() => window.ramp.displayUnits())
    })
  }, {
    flush: 'post',
    immediate: true,
  })

  useMeta(() => ({
    script: [ {
      // load GPT early to enable funding choices
      key: 'gpt',
      src: '//securepubads.g.doubleclick.net/tag/js/gpt.js',
      async: true,
    }, {
      key: 'playwire-ramp',
      src: `//cdn.intergient.com/${publisherId}/${siteId}/ramp.js`,
      async: true,
    }, {
      key: 'playwire-ramp-init',
      innerHTML: `
        window.ramp = window.ramp || {};
        window.ramp.que = window.ramp.que || [];
        window.ramp.passiveMode = true;
      `.replace(/\s+/g, ' '),
    }, {
      key: 'playwire-ramp-ga4',
      innerHTML: `
        window._pwGA4PageviewId = ''.concat(Date.now());
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
        );
      `.replace(/\s+/g, ' '),
    } ],
  }))
}
