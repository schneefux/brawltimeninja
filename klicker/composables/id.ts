import { ssrRef } from '@nuxtjs/composition-api'
import { ref } from 'vue-demi'

export const useUniqueId = () => {
  const randomId = Math.random().toString().slice(2)
  // TODO does not work because ssrRef uses dumb keys
  const id = ssrRef != undefined ? ssrRef(randomId) : ref(randomId)

  return {
    id,
  }
}
