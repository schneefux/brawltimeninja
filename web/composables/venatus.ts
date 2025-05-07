import { onMounted, ref, onBeforeUnmount, watch } from "vue"
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

  onMounted(() => {
    self.__VM = self.__VM || []
    self.__VM.push((admanager: any, scope: any) => {
      scope.Instances.pageManager.on('navigated', () => {
        scope.Instances.pageManager.newPageSession(false)
      }, false)
    })
  })

  const placements = ref<{ name: string, instance: any }[]>([])

  const mountStickies = () => {
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

        placements.value.push({
          name,
          instance,
        })
      }
    })
  }

  const unmountStickies = () => {
    self.__VM.push(function (admanager: any, scope: any) {
      placements.value.forEach((placement) => {
        console.log("[PROSPER] removed", placement.name)
        if (placement.name === "vertical_sticky") {
          scope.Config.verticalSticky().destroy()
        } else {
          placement.instance.remove()
        }
      })

      placements.value = []
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
}
