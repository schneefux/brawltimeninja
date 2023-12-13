<template>
  <b-card :loading="loading">
    <template v-slot:content>
      <table id="table" class="w-full">
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
</template>

<script lang="ts">
import { capitalize } from '~/lib/util'
import { defineComponent, PropType } from 'vue'
import { BCard } from '@schneefux/klicker/components'
import { Club } from '~/model/Brawlstars'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    club: {
      type: Object as PropType<Club>,
      required: true
    },
  },
  async setup() {
    return {
      capitalize,
    }
  },
})
</script>
