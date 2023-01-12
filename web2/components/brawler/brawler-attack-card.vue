<template>
  <b-card
    :icon="iconUrl"
    :icon-alt="`${prop} Icon`"
    :title="scrapedDataProp.name"
  >
    <template v-slot:content>
      <div class="h-full flex flex-col justify-between gap-y-4">
        <p>
          <q class="italic">{{ scrapedDataProp.description }}</q>
        </p>
        <b-kv-table
          :rows="kvTableRows"
          :data="kvTableData"
        ></b-kv-table>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ScrapedBrawler } from '~/model/Web'
import { BCard, BKvTable } from '@schneefux/klicker/components'
import { useContext } from '@/composables/compat'
import attackIconUrl from '~/assets/images/attack-icon.png'
import superIconUrl from '~/assets/images/super-icon.png'

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
      type: String as PropType<'attack'|'super'>,
      required: true
    },
    level: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const { i18n } = useContext()
    const iconUrl = computed(() => props.prop == 'attack' ? attackIconUrl : superIconUrl)

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
      iconUrl,
      scrapedDataProp,
      kvTableRows,
      kvTableData,
    }
  }
})
</script>
