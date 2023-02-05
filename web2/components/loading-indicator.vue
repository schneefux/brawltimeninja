<template>
  <client-only>
    <Teleport to="body">
      <div
        class="fixed top-0 inset-x-0 pointer-events-none h-[2px] bg-secondary-500 z-50 transition-all duration-300"
        :style="style"
      ></div>
    </Teleport>
  </client-only>
</template>

<script lang="ts">
import { useIsFetching } from '@tanstack/vue-query'
import { useIntervalFn, useTimeoutFn } from '@vueuse/shared'
import { computed, defineComponent, watch, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup () {
    const isFetching = useIsFetching()

    const progress = ref(0)
    const duration = 2000
    const interval = 500
    const step = 100 / (duration / interval)
    const { pause, resume, isActive } = useIntervalFn(() => {
      progress.value = Math.min(100, progress.value + step)
    }, interval, { immediate: false })
    const animationEndTimeout = useTimeoutFn(pause, interval, { immediate: false })

    const start = () => {
      if (isActive.value) {
        return
      }

      progress.value = 0
      resume()
    }

    const stop = () => {
      if (isFetching.value > 0 || !isActive.value) {
        return
      }

      progress.value = 100
      animationEndTimeout.start()
    }

    const router = useRouter()
    router.beforeEach(start)

    // give queries some time to fire
    const stopTimeout = useTimeoutFn(stop, 1000, { immediate: false })
    router.afterEach(() => stopTimeout.start())

    watch(isFetching, (val) => {
      if (val > 0) {
        start()
      }
      if (val == 0) {
        stop()
      }
    })

    const style = computed(() => ({
      width: `${progress.value}%`,
      display: isActive.value ? '' : 'none',
      backgroundSize: `${(100 / progress.value) * 100}% auto`,
    }))

    return {
      style,
    }
  }
})
</script>
