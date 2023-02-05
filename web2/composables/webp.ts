import { onMounted, ref } from "vue";

export function useSupportsWebp() {
  const supportsWebp = ref(true)

  onMounted(() =>
    supportsWebp.value = (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0)
  )

  return supportsWebp
}
