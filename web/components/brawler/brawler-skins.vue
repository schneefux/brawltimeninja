<template>
  <b-scrolling-list
    :items="skins"
    :cell-columns="2"
    :cell-rows="3"
    :render-at-least="5"
    key-id="id"
    render-placeholder
  >
    <template v-slot:item="skin">
      <b-card :title="skin.name">
        <template v-slot:content>
          <div class="h-full flex flex-col items-center justify-between">
            <media-img
              :path="skin.path.replace(/\.(png|gif)/, '')"
              :alt="skin.name"
              clazz="max-h-48"
              size="400"
              loading="lazy"
            ></media-img>
            <b-kv-table
              :rows="[{
                title: $t('brawler.skin.cost'),
                key: 'cost',
              }, {
                title: $t('brawler.skin.campaign'),
                key: 'campaign',
              }]"
              :data="skin"
              class="w-full mt-4"
            ></b-kv-table>
          </div>
        </template>
      </b-card>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingList, BCard, BKvTable } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingList,
    BKvTable,
    BCard,
  },
  props: {
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: false
    },
  },
  setup(props) {
    const skins = computed(() => props.scrapedData?.skins.flatMap(list => list.skins.map(skin => ({
      ...skin,
      id: `${list.name}-${skin.name}`,
    }))) ?? [])

    return {
      skins,
    }
  },
})
</script>
