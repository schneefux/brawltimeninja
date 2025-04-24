import { onMounted } from "vue"
import { useMeta } from "./compat"

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
}
