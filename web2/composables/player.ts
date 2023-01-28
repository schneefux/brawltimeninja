import { tagPattern } from "@/lib/util"
import { useBrawlstarsStore } from "@/stores/brawlstars"
import { TRPCClientError } from "@trpc/client"
import { Ref } from "vue"
import { useI18n } from "vue-i18n"
import { useContext, useValidate } from "./compat"

export async function useLoadAndValidatePlayer(tag: Ref<string>, urlPrefix: string) {
  const { $sentry } = useContext()
  const i18n = useI18n()
  const store = useBrawlstarsStore()

  return useValidate(async ({ params, redirect, error }) => {
    const tagU = tag.value.toUpperCase()
    if (tagU != tag.value) {
      // fuck Bing for lowercasing all URLs
      redirect(301, urlPrefix + tagU)
      return
    }

    if (!tagPattern.test(tagU)) {
      return false
    }

    if (store.player != undefined && store.player.tag == params.tag) {
      return true
    }

    try {
      await store.loadPlayer(tagU)
    } catch (err: any) {
      if (err.response?.status == 404) {
        return
      }

      if (err instanceof TRPCClientError) {
        if (err.data?.httpStatus == 404) {
          error({ statusCode: 404, message: i18n.t('error.tag.not-found') })
          return
        }
        if (err.data?.httpStatus >= 400) {
          error({ statusCode: err.data.httpStatus, message: i18n.t('error.api-unavailable') })
          return
        }
      }

      console.error(err)
      $sentry.captureException(err)
      error({ statusCode: 500, message: ' ' })
    }

    return true
  })
}
