<template>
  <div
    ref="placement"
    class="vm-placement"
    :data-placement="placementName"
  ></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, nextTick, onMounted, useTemplateRef, PropType } from 'vue'

export default defineComponent({
  props: {
    placementName: {
      type: String as PropType<'billboard'|'leaderboard'|'double_mpu'|'mpu'|'mobile_banner'|'mobile_mpu'|'skyscraper'|'video'|'desktop_takeover'|'mobile_takeover'|'video_slider'|'vertical_sticky'|'mobile_horizontal_sticky'|'horizontal_sticky'|'interstitial'>,
      required: true
    },
    instanceName: {
      type: String,
      required: false
    },
  },
  setup(props) {
    const elRef = useTemplateRef<HTMLDivElement>('placement')
    let placement: any

    // log statements were requested by Venatus
    const addPlacement = (el: HTMLElement) => {
      self.__VM = self.__VM || []
      self.__VM.push(function (admanager: any, scope: any) {
        console.log("[PROSPER] add", props.placementName)
        if (props.placementName === "vertical_sticky") {
          scope.Config.verticalSticky().display()
        } else if (
          props.placementName === "horizontal_sticky" ||
          props.placementName === "mobile_horizontal_sticky" ||
          props.placementName === "video_slider"
        ) {
          placement = scope.Config.get(props.placementName).displayBody()
        } else {
          placement = scope.Config.get(props.placementName).display(elRef.value)
        }
      })
    }

    const removePlacement = (el: HTMLElement) => {
      self.__VM.push(function (admanager: any, scope: any) {
        console.log("[PROSPER] removed", props.placementName)
        if (props.placementName === "vertical_sticky") {
          scope.Config.verticalSticky().destroy()
        } else {
         placement.remove()
        }
      })
    }

    onMounted(() => {
      nextTick(() => {
        if (elRef.value != null) {
          addPlacement(elRef.value)
        }
      })
    })

    onBeforeUnmount(() => {
      if (elRef.value != null) {
        removePlacement(elRef.value)
      }
    })
  },
})
</script>
