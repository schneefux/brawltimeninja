import fetch from 'cross-fetch' // ponyfill
import { useContext, ref, onMounted } from '@nuxtjs/composition-api'
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'

export default function useFeathers() {
  const { $config } = useContext()
  const client = feathers()

  client.configure(rest($config.managerUrl).fetch(fetch))
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
