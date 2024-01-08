<template>
  <b-card :loading="loading">
    <template v-slot:content>
      <table id="table" class="w-full">
        <thead>
          <tr class="h-8 border-b border-gray-600 text-left">
            <th scope="col">
              {{ $t('metric.name') }}
            </th>
            <th
              scope="col"
            >
              {{ $t('metric.latest-battle') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.tag"
            class="pt-1"
          >
            <th scope="row" class="pr-2 text-left">
              <router-link
                :to="localePath(`/profile/${row.tag}`)"
                :title="row.name"
                @click.stop
              >
                <media-img
                  :path="`/avatars/${row.iconId}`"
                  size="200"
                  clazz="h-8 w-8 mr-1 inline object-contain"
                ></media-img>
                <span>{{ row.name }}</span>
              </router-link>
            </th>
            <td>
              <relative-time :timestamp="row.lastActive" add-suffix></relative-time>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { BCard } from '@schneefux/klicker/components'
import { Club } from '~/model/Brawlstars'
import { ClubActivityStatistics } from '~/model/Api'

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
    clubActivityStatistics: {
      type: Object as PropType<ClubActivityStatistics>,
      required: false
    },
  },
  async setup(props) {
    const rows = computed(() => props.club.members.map(m => ({
      tag: m.tag,
      name: m.name,
      iconId: m.icon.id,
      lastActive: props.clubActivityStatistics?.lastActive[m.tag],
    })).sort((m1, m2) => {
      if (m1.lastActive === undefined && m2.lastActive === undefined) {
        return 0;
      } else if (m1.lastActive === undefined) {
        return 1;
      } else if (m2.lastActive === undefined) {
        return -1;
      } else {
        return m2.lastActive.valueOf() - m1.lastActive.valueOf();
      }
    }))

    return {
      rows,
    }
  },
})
</script>
