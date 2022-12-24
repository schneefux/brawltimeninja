import { isRef, ref, Ref } from "vue"

export const useLazyAsyncData = <T>(
  key: string | Ref<null>,
  cb: () => T | Promise<T>,
) => {
  const _ref = isRef(key) ? key : ref<T | null>(null)

  if (!_ref.value) {
    const p = Promise.resolve(cb())
    p.then(res => (_ref.value = res as any))
  }

  return {
    error: ref(),
    data: _ref as Ref<null | T>,
    pending: ref(false),
  }
}

export const useNuxtApp = () => ({
  $sentry: undefined,
})
