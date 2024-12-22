import { tagPattern } from "~/lib/util"
import { useBrawlstarsStore } from "~/stores/brawlstars"
import { TRPCClientError } from "@trpc/client"
import { useI18n } from "vue-i18n"
import { useValidate } from "./compat"
import { computed, Ref } from 'vue'

export async function useLoadAndValidatePlayer(urlPrefix: string) {
  const i18n = useI18n()
  const store = useBrawlstarsStore()

  const validatePromise = useValidate(async ({ params, redirect, error }) => {
    const tag = (params.tag as string).toUpperCase()
    if (tag != params.tag) {
      // fuck Bing for lowercasing all URLs
      redirect(301, urlPrefix + tag)
      return
    }

    if (!tagPattern.test(tag)) {
      return false
    }

    if (store.player != undefined && store.player.tag == params.tag) {
      return true
    }

    try {
      await store.loadPlayer(tag)
      return true
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
          error({ statusCode: 503, message: i18n.t('error.api-unavailable') })
          return
        }
      }

      console.error(err)
      error({ statusCode: 500, message: ' ' })
    }
  })

  if (import.meta.env.SSR) {
    await validatePromise
  }
}

// tag without hash
export function usePlayerRender(playerTag: Ref<string>, selectedBrawlerId?: Ref<string|undefined>, selectedBackground?: Ref<string>) {
  return computed(
    () => `/api/render/profile/${playerTag.value}/${selectedBrawlerId?.value ?? 'best'}.png?background=${selectedBackground?.value ?? 'brawl_stars_lobby.jpg'}`)
}
