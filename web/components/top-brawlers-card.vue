<template>
  <b-card
    :title="$t('best.brawlers.long')"
    :elevation="elevation"
  >
    <template v-slot:actions>
      <div class="space-x-2">
        <b-button
          :to="localePath(`/team-builder`)"
          primary
          sm
        >
          {{ $t('action.open.draft-tool') }}
        </b-button>

        <b-button
          :to="localePath(`/tier-list/brawler`)"
          primary
          sm
        >
          {{ $t('action.open.tier-list.brawler') }}
        </b-button>
      </div>
    </template>

    <template v-slot:content>
      <map-best-brawlers :limit="limit"></map-best-brawlers>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BButton, CQuery } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BButton,
    CQuery,
  },
  props: {
    limit: {
      type: Number,
      default: 3
    },
    elevation: {
      type: Number,
      default: 2
    },
  },
})
</script>
