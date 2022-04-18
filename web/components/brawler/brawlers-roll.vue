<template>
  <b-scrolling-list
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
        <div
          slot="content"
          class="h-full flex flex-col items-center justify-between"
        >
          <media-img
            :path="'/brawlers/' + brawler.id + '/model'"
            :alt="brawler.name"
            clazz="h-48 object-contain"
            size="400"
            loading="lazy"
          ></media-img>
        </div>
      </b-card>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import { defineComponent, useAsync, useContext } from '@nuxtjs/composition-api'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { BScrollingList, BCard } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingList,
    BCard,
  },
  setup() {
    const { $klicker } = useContext()

    const brawlers = useAsync(async () => {
      const brawlers = await $klicker.queryAllBrawlers()
      return brawlers.map(b => ({
        id: brawlerId({ name: b }),
        name: capitalizeWords(b.toLowerCase()),
      }))
    }, 'all-brawlers')

    return {
      brawlers,
    }
  },
})
</script>
