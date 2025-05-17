<template>
  <b-card
    :title="$t('component.best-brawlers.long')"
    :elevation="elevation"
  >
    <template v-slot:actions>
      <b-button
        :to="localePath(`/tier-list/brawler`)"
        primary
        sm
      >
        {{ $t('action.open.tier-list.brawler') }}
      </b-button>
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
