import { useRoute } from "vue-router";
import { watch } from "vue"
import { useMeta } from "./compat";

export type TaggedType = 'leaderboard_atf' | 'leaderboard_btf' | 'med_rect_atf' | 'med_rect_btf' | 'sky_atf' | 'sky_btf'
export type TaglessType = 'trendi_video' | 'corner_ad_video' | 'site_skin' | 'flex_leaderboard' | 'right_rail' | 'bottom_rail' | 'left_rail' | 'in_content' | 'sidebar' | 'sticky_sidebar'

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
      setPath: (path?: string) => Promise<void>;
      triggerRefresh: () => void;
      showCmpModal: () => void;
      onReady: (callback: () => void) => void;
      onPlayerReady: (callback: () => void) => void;
      que: (() => void)[];
    };
  }
}

export function usePlaywireRamp(publisherId: string, siteId: string) {
  const outOfPageUnits = ([
    'trendi_video',
    'corner_ad_video',
    'site_skin',
    'flex_leaderboard',
    'right_rail',
    'bottom_rail',
    'left_rail',
    // 'in_content',
    'sidebar',
    'sticky_sidebar',
  ] satisfies TaglessType[]).map(unit => ({ type: unit }) satisfies TaglessUnit)

  const route = useRoute()

  watch(() => route.path, () => {
    // do not refresh ads when just the params or the hash changes
    if (import.meta.env.SSR) {
      return
    }

    window.ramp.que.push(async () => {
      let slotsToRemove: string[] = []
      Object.entries(window.ramp.settings.slots).forEach(([slotName, slot]: [string, any]) => {
        if (outOfPageUnits.some(unit => unit.type == slot.type) || slot.videoType === 'Bolt Player') {
          slotsToRemove.push(slotName)
        }
      })

      await window.ramp.destroyUnits(slotsToRemove)
      await window.ramp.setPath(route.path)
      await window.ramp.addUnits(outOfPageUnits)
      await window.ramp.displayUnits()
    })
  }, { immediate: true })

  useMeta(() => ({
    script: [ {
      key: 'playwire-ramp-init',
      type: 'text/javascript',
      innerHTML: `
        window.ramp = window.ramp || {};
        window.ramp.que = window.ramp.que || [];
        window.ramp.passiveMode = true;
      `.replace(/\s+/g, ' '),
      tagPriority: 31,
    }, {
      key: 'playwire-ramp',
      src: `//cdn.intergient.com/${publisherId}/${siteId}/ramp.js`,
      async: true,
      tagPriority: 31,
    } ],
  }))
}
