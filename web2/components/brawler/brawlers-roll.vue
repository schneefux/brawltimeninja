<template>
  <b-scrolling-list
    v-if="brawlers == undefined || brawlers.length > 0"
    :items="brawlers || []"
    :cell-columns="2"
    :cell-rows="2"
    :render-at-least="5"
    key-id="id"
    render-placeholder
  >
    <template v-slot:preview="brawler">
      <media-img
        :path="`/brawlers/${brawler.id}/avatar`"
        :alt="brawler.name"
        size="160"
        clazz="h-8 w-8 object-contain"
      ></media-img>
    </template>

    <template v-slot:item="brawler">
      <b-card
        :title="brawler.name"
        :link="localePath(`/tier-list/brawler/${brawler.id}`)"
      >
        <template v-slot:content><div

          class="h-full flex flex-col items-center justify-between"
        >
          <media-img
            :path="'/brawlers/' + brawler.id + '/model'"
            :alt="brawler.name"
            clazz="h-48 object-contain"
            size="400"
            loading="lazy"
          ></media-img>
        </div></template>
      </b-card>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { BScrollingList, BCard } from '@schneefux/klicker/components'
import { useContext, useAsync } from '~/composables/compat'

export default defineComponent({
  components: {
    BScrollingList,
    BCard,
  },
  setup() {
    const { $klicker } = useContext()

    const allBrawlers = useAsync(() => $klicker.queryAllBrawlers(), 'all-brawlers')
    const brawlers = computed(() => {
      if (allBrawlers.value == undefined) {
        return undefined
      }

      return allBrawlers.value.map(b => ({
        id: brawlerId({ name: b }),
        name: capitalizeWords(b.toLowerCase()),
      }))
    })

    return {
      brawlers,
    }
  },
})
</script>
