import { ref, computed, Ref } from "@nuxtjs/composition-api"
import { throttledWatch } from '@vueuse/core'
import useFeathers from './feathers'

/**
 * Sync an object with a feathers service
 */
export const useStorage = <O extends { id: number|undefined }>(service: string, defaultObject: O) => {
  const { client, isLoggedIn: canSave } = useFeathers()

  const data = ref<O>(defaultObject) as Ref<O>
  const unsavedChanges = ref<boolean>(false)

  const storage = computed<O>({
    get() {
      return data.value
    },
    set(object: O) {
      data.value = object
      unsavedChanges.value = true
    }
  })

  throttledWatch(unsavedChanges, async () => {
    if (unsavedChanges.value) {
      await save()
    }
  }, { throttle: 1000 })

  const save = async () => {
    if (!canSave.value) {
      return
    }

    if (data.value.id == undefined) {
      data.value = await client.service(service).create(data.value)
    } else {
      data.value = await client.service(service).update(data.value.id, data.value)
    }
    unsavedChanges.value = false
  }

  const update = async (id: number) => {
    storage.value = await client.service(service).get(id) as O
    unsavedChanges.value = false
  }

  return {
    canSave,
    save,
    update,
    storage,
    unsavedChanges,
  }
}
