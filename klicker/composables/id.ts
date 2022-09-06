import { ref, nextTick, onMounted, getCurrentInstance } from 'vue'

export const useUniqueId = () => {
  const id = ref()
  const instance = getCurrentInstance()
  onMounted(() => nextTick(() => {
    if (instance != null) {
      id.value = `__KLICKERID__${(<any>instance).uid}`
    }
  }))

  return {
    id,
  }
}
