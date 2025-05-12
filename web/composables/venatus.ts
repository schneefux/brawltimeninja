import { onMounted, ref, onBeforeUnmount, watch, Ref, computed } from "vue"
import { useBreakpoints } from '@vueuse/core'
import { useMeta } from "./compat"
import { useRoute } from "vue-router"

export function useVenatus() {
  useMeta(() => ({
    script: [ {
      key: 'venatus',
      src: `https://hb.vntsm.com/v4/live/vms/sites/brawltime.ninja/index.js`,
      async: true,
      tagPriority: 31,
    } ],
  }))

  const placements = ref<Record<string, any>>({})

  const mountStickies = () => {
    if (Object.keys(self.__VM_payload_stickies).length > 0) {
      placements.value = self.__VM_payload_stickies
      self.__VM_payload_stickies = {}
      // rendered by page load script, skip
      return
    }

    self.__VM = self.__VM || []
    self.__VM.push(function (admanager: any, scope: any) {
      for (const name of ["vertical_sticky", "horizontal_sticky", "mobile_horizontal_sticky"]) {
        console.log("[PROSPER] add", name)

        let instance;
        if (name === "vertical_sticky") {
          instance = scope.Config.verticalSticky()
        } else {
          instance = scope.Config.get(name).displayBody()
        }

        placements.value = {
          ...placements.value,
          [name]: instance,
        }
      }
    })
  }

  const unmountStickies = () => {
    self.__VM.push(function (admanager: any, scope: any) {
      Object.keys(placements.value).forEach((name) => {
        console.log("[PROSPER] remove", name)
        if (name === "vertical_sticky") {
          scope.Config.verticalSticky().destroy()
        } else {
          placements.value[name].instance.remove()
        }
      })

      placements.value = {}
    })
  }

  onMounted(() => mountStickies())
  onBeforeUnmount(() => unmountStickies())

  // request by Venatus: ads should be refreshed on page navigation
  const route = useRoute()
  watch(route, () => {
    unmountStickies()
    mountStickies()
  })

  useMeta(() => {
    if (!import.meta.env.SSR) {
      return {}
    }

    return {
      script: [ {
        innerHTML:
`self.__VM = self.__VM || [];
self.__VM_payload_stickies = self.__VM_payload || {};
self.__VM.push(function (admanager, scope) {
  for (const placementName of ["vertical_sticky", "horizontal_sticky", "mobile_horizontal_sticky"]) {
    console.log("[PROSPER] add", placementName, "(page load)");
    if (placementName === "vertical_sticky") {
      self.__VM_payload_stickies[placementName] = scope.Config.verticalSticky();
    } else {
      self.__VM_payload_stickies[placementName] = scope.Config.get(placementName).displayBody();
    }
  }

  scope.Instances.pageManager.on('navigated', () => {
    scope.Instances.pageManager.newPageSession(false);
  }, false);
});`,
      } ],
    }
  })
}

type PlacementName = 'billboard'|'leaderboard'|'double_mpu'|'mpu'|'mobile_banner'|'mobile_mpu'|'skyscraper'|'video'|'desktop_takeover'|'mobile_takeover'|'video_slider'|'vertical_sticky'|'mobile_horizontal_sticky'|'horizontal_sticky'|'interstitial'
function usePlacementRef(idRef: Ref<string>, placementRef: Ref<HTMLElement|null>, placementName: Ref<PlacementName>) {
  const instance = ref<any>()

  // log statements were requested by Venatus
  const addPlacement = (element: HTMLElement, placementName: string) => {
    if (self.__VM_payload[idRef.value]) {
      instance.value = self.__VM_payload[idRef.value]
      delete self.__VM_payload[idRef.value]
      // rendered by page load script, skip
      return
    }

    self.__VM = self.__VM || []
    self.__VM.push(function (admanager: any, scope: any) {
      if (instance.value) {
        console.log("[PROSPER] remove", `#${idRef.value}`)
        instance.value.remove()
        instance.value = undefined
      }

      console.log("[PROSPER] add", placementName, `#${idRef.value}`)
      instance.value = scope.Config.get(placementName).display(element)
    })
  }

  const removePlacement = () => {
    self.__VM.push(function (admanager: any, scope: any) {
      if (!instance.value) {
        return
      }

      console.log("[PROSPER] remove", `#${idRef.value}`)
      instance.value.remove()
      instance.value = undefined
    })
  }

  watch(() => [ placementRef.value, placementName.value ], () => {
    if (import.meta.env.SSR) {
      return
    }

    if (!placementRef.value) {
      return
    }

    addPlacement(placementRef.value, placementName.value)
  }, { immediate: true })

  onBeforeUnmount(() => {
    removePlacement()
  })
}

export const usePlacement = (
  idRef: Ref<string>,
  placementRef: Ref<HTMLElement|null>,
  placementNames: Ref<{
    desktop: string,
    mobile: string,
  }>,) => {
  const breakpoints = useBreakpoints({
    desktop: 1024, // breakpoint which Venatus uses
  })
  const desktop = breakpoints.greaterOrEqual('desktop')
  // TODO it would be nicer to use responsive tags, but the video doesn't seem to render correctly when using it

  usePlacementRef(
    idRef,
    placementRef,
    computed(() => desktop.value ? placementNames.value.desktop : placementNames.value.mobile),
  )

  useMeta(() => {
    if (!import.meta.env.SSR) {
      return {}
    }

    return {
      script: [
        {
          // request by Venatus: mobile_takeover should be rendered on initial page load
          innerHTML:
`self.__VM = self.__VM || [];
self.__VM_payload = self.__VM_payload || {};
self.__VM.push(function (admanager, scope) {
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const placementName = isDesktop ? "${placementNames.value.desktop}" : "${placementNames.value.mobile}";
  console.log("[PROSPER] add", placementName, "${idRef.value}", "(page load)");
  self.__VM_payload["${idRef.value}"] = scope.Config.get(placementName).display("${idRef.value}");
});`,
        }
      ]
    }
  })
}
