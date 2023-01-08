<template>
  <b-card
    :icon="require(`~/assets/images/${prop}-icon.png`)"
    :icon-alt="`${prop} Icon`"
    :title="scrapedDataProp.name"
  >
    <template v-slot:content><div
      
      class="h-full flex flex-col justify-between gap-y-4"
    >
      <p>
        <q class="italic">{{ scrapedDataProp.description }}</q>
      </p>
      <b-kv-table
        :rows="kvTableRows"
        :data="kvTableData"
      ></b-kv-table>
    </div></template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useContext } from 'vue'
import { ScrapedBrawler } from '~/model/Web'
import { BCard, BKvTable } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BCard,
    BKvTable,
  },
  props: {
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: true
    },
    prop: {
      type: String,
      required: true
    },
    level: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const { i18n } = useContext()

    const scrapedDataProp = computed(() => props.scrapedData[props.prop])
    const kvTableRows = computed(() => ([
      ...scrapedDataProp.value.statsByLevel.map((attack, index) => ({
        title: attack.name,
        key: `statsByLevel.${index}.list.${parseInt(props.level) - 1}`,
      })),
      ...Object.keys(scrapedDataProp.value.stats).map((key) => ({
        title: i18n.t('metric.' + key.replace(props.prop, '')),
        key,
      })),
    ]))
    const kvTableData = computed(() => ({
      ...scrapedDataProp.value.stats,
      statsByLevel: scrapedDataProp.value.statsByLevel,
    }))

    return {
      scrapedDataProp,
      kvTableRows,
      kvTableData,
    }
  }
})
</script>
