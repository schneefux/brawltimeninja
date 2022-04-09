<template>
  <b-card
    :title="$t('best.brawlers.long')"
    :elevation="elevation"
    full-height
  >
    <div
      slot="actions"
      class="flex flex-wrap justify-end gap-2"
    >
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

    <map-best-brawlers
      slot="content"
      :limit="limit"
    ></map-best-brawlers>
  </b-card>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
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
