import fetch from 'cross-fetch' // ponyfill
import { ref, onMounted } from 'vue-demi'
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'
import { useContext } from '@nuxtjs/composition-api'

export default function useFeathers() {
  const { $managerUrl }: any = useContext()

  const client = feathers()

  client.configure(rest($managerUrl as string).fetch(fetch))
  client.configure(auth())

  const isLoggedIn = ref(false)
  onMounted(async () => {
    try {
      await client.reAuthenticate()
      isLoggedIn.value = true
    } catch (e) {
      isLoggedIn.value = false
    }
  })

  return {
    isLoggedIn,
    client,
  }
}
