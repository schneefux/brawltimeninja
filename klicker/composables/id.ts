import { ref, getCurrentInstance } from 'vue'

export const useUniqueId = () => {
  const id = ref()
  const instance = getCurrentInstance()
  if (instance != null) {
    const uid = instance?.uid
    id.value = `klicker-${uid}`
  }

  return {
    id,
  }
}
