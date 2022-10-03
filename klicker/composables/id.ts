import { ref, nextTick, onMounted, getCurrentInstance } from 'vue'

export const useUniqueId = () => {
  const id = ref()
  const instance = getCurrentInstance() as any
  onMounted(() => nextTick(() => {
    if (instance != null) {
      const uid = instance?.uid ?? instance?.proxy?._uid
      id.value = `__KLICKERID__${uid}`
    }
  }))

  return {
    id,
  }
}
