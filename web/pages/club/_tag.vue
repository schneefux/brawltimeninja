<template>
  <b-page class="max-w-md">
    <b-card
      v-if="club != undefined"
      :title="club.name"
    >
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
import { capitalize } from '@/lib/util'
import { Club } from '@/model/Brawlstars'
import { defineComponent, ref, useContext, useFetch, useMeta, useRoute } from '@nuxtjs/composition-api'

export default defineComponent({
  head: {},
  middleware: ['cached'],
  setup() {
    const { app: { i18n }, $http, $config, redirect } = useContext()
    const route = useRoute()

    const club = ref<Club>()
    useFetch(async () => {
      const tag = route.value.params.tag.toUpperCase()
      if (tag != route.value.params.tag) {
        redirect(`/club/${tag}`)
      } else {
        club.value = await $http.$get<Club>($config.apiUrl + `/api/club/${tag}`)
      }
    })

    useMeta(() => {
      const description = club.value != undefined ? i18n.tc('club.meta.description', 1, { club: club.value.name }) + ' ' + club.value.description : ''
      return {
        title: club.value != undefined ? i18n.tc('club.meta.title', 1, { club: club.value.name }) : '',
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', name: 'og:description', content: description },
        ],
      }
    })

    return {
      club,
      capitalize,
    }
  },
})
</script>
