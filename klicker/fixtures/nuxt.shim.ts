import { isRef, ref, Ref } from "vue"

export const useLazyAsyncData = <T>(
  key: string | Ref<null>,
  cb: () => T | Promise<T>,
): Ref<null | T> => {
  const _ref = isRef(key) ? key : ref<T | null>(null)

  if (!_ref.value) {
    const p = Promise.resolve(cb())
    p.then(res => (_ref.value = res as any))
  }

  return _ref as Ref<null | T>
}

export const useNuxtApp = () => ({
  $sentry: undefined,
})
