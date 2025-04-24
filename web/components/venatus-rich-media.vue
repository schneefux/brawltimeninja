<template></template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, onMounted } from 'vue'

export default defineComponent({
  setup() {
    const placements = ref<{ name: string, instance: any }[]>([])

    onMounted(() => {
      self.__VM = self.__VM || []
      self.__VM.push(function (admanager: any, scope: any) {
        console.log("[PROSPER] add vertical_sticky")
        scope.Config.verticalSticky().display()
        for (const name of ["horizontal_sticky", "mobile_horizontal_sticky"]) {
          console.log("[PROSPER] add", name)
          placements.value.push({
            name,
            instance: scope.Config.get(name).displayBody(),
          })
        }
      })
    })

    onBeforeUnmount(() => {
      self.__VM.push(function (admanager: any, scope: any) {
        placements.value.forEach((placement) => {
          console.log("[PROSPER] removed", placement.name)
          if (placement.name === "vertical_sticky") {
            scope.Config.verticalSticky().destroy()
          } else {
            placement.instance.remove()
          }
        })
      })
    })
  },
})
</script>

<style>
@reference "~/assets/css/tailwind.css";

/* leave space for sticky footer */
#main {
  @apply max-md:pb-[100px]!; /* sticky footer height */
}

/* push footer above bottom nav */
.vm-footer {
  @apply max-md:bottom-14!; /* 3.5rem (14) for footer */
}

/* push instream video player above bottom nav and sticky ad */
avp-player-ui {
  /* 3.5rem (14) for footer + 50px for mobile footer ad + 0.75rem padding */
  --avp-offset-bottom: 120px !important;

  --avp-offset-right: 8px !important;
}
</style>
