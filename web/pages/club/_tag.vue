<template>
  <b-page
    v-if="club != undefined"
    class="max-w-md"
  >
    <b-card :title="club.name">
      <template v-slot:content>
        <blockquote class="mt-2 italic">
          {{ club.description }}
        </blockquote>

        <table class="mt-2 w-full">
          <thead>
            <tr class="h-8 border-b border-gray-600 text-left">
              <th scope="col">
                {{ $t('metric.name') }}
              </th>
              <th scope="col">
                {{ $t('metric.club-role') }}
              </th>
              <th scope="col">
                {{ $t('metric.trophies') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="member in club.members"
              :key="member.tag"
              class="pt-1"
            >
              <th scope="row" class="pr-2 text-left">
                <router-link
                  :to="localePath(`/profile/${member.tag}`)"
                  :title="member.name"
                  @click.stop
                >
                  <media-img
                    :path="`/avatars/${member.icon.id}`"
                    size="200"
                    clazz="h-8 w-8 mr-1 inline object-contain"
                  ></media-img>
                  <span>{{ member.name }}</span>
                </router-link>
              </th>
              <td>
                {{ capitalize(member.role).replace('VicePresident', 'Vice President') }}
              </td>
              <td class="text-center">
                {{ member.trophies }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </b-card>
  </b-page>
</template>

<script lang="ts">
import { useApi, useBlockingAsync, useCacheHeaders, useMeta, useSentry } from '@/composables/compat'
import { capitalize, tagPattern } from '@/lib/util'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { TRPCClientError } from '@trpc/client'

export default defineComponent({
  async setup() {
    const i18n = useI18n()
    const $api = useApi()
    const sentry = useSentry()

    useCacheHeaders()

    const club = await useBlockingAsync(async ({ params, redirect, error }) => {
      const tag = (params.tag as string).toUpperCase()
      if (tag != params.tag) {
        // fuck Bing for lowercasing all URLs
        redirect(301, `/club/${tag}`)
        return
      }

      if (!tagPattern.test(tag)) {
        return
      }

      try {
        return await $api.club.byTag.query(tag)
      } catch (err: any) {
        if (err instanceof TRPCClientError) {
          if (err.data?.httpStatus == 404) {
            error({ statusCode: 404, message: i18n.t('error.tag.not-found') })
          }
          if (err.data?.httpStatus >= 400) {
            error({ statusCode: err.data.httpStatus, message: i18n.t('error.api-unavailable') })
          }
        }

        sentry.captureException(err)
        error({ statusCode: 500, message: '' })
      }
    }, 'club')

    useMeta(() => {
      return {
        title: club.value != undefined ? i18n.t('club.meta.title', { club: club.value.name }) : '',
        meta: [ {
          hid: 'description',
          name: 'description',
          content: club.value != undefined ? i18n.t('club.meta.description', { club: club.value.name }) + ' ' + club.value.description : '',
        } ],
      }
    })

    return {
      club,
      capitalize,
    }
  },
})
</script>
