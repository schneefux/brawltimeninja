import fetch from 'cross-fetch' // ponyfill
import { ref, onMounted } from 'vue'
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'
import { useNuxtApp } from '#imports'

export default function useFeathers() {
  const { $managerUrl }: any = useNuxtApp()

  const client = feathers() as any // TODO

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
