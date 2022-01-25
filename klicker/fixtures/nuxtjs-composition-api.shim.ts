import { isRef, ref, Ref } from "vue-demi"

export const useAsync = <T>(
  cb: () => T | Promise<T>,
  key?: string | Ref<null>
): Ref<null | T> => {
  const _ref = isRef(key) ? key : ref<T | null>(null)

  if (!_ref.value) {
    const p = Promise.resolve(cb())
    p.then(res => (_ref.value = res as any))
  }

  return _ref as Ref<null | T>
}

export const useContext = () => ({
  $sentry: undefined,
})
