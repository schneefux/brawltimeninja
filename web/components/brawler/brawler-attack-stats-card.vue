<template>
  <b-card
    :title="attack == 'main' ? $t('brawler.main-attack') : $t('brawler.super-attack')"
    full-height
  >
    <div
      slot="content"
      class="h-full flex flex-col justify-between"
    >
      <p>
        <q class="italic">{{ info[attack].description }}</q>
      </p>
      <b-kv-table
        v-if="rows.length > 0"
        :rows="rows"
        :data="data"
        id-key="id"
        class="mt-4"
      ></b-kv-table>
    </div>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, useContext } from '@nuxtjs/composition-api'
import { BrawlerData } from '~/model/Media'
import { BKvTable } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BKvTable,
  },
  props: {
    attack: {
      type: String,
      required: true
    },
    info: {
      type: Object as PropType<BrawlerData>,
      required: true
    },
  },
  setup(props) {
    const { i18n } = useContext()

    // TODO refactor
    const table = computed(() => {
      const data: string[][] = []
      if (props.info[props.attack].rechargeTime != null) {
        data.push([ i18n.t('metric.reloadSpeed') as string, props.info[props.attack].rechargeTime.toString() + 'ms' ])
      }
      if (props.info[props.attack].range != null) {
        data.push([ i18n.t('metric.range') as string, props.info[props.attack].range.toFixed(1) ])
      }
      if (props.info[props.attack].damageCount != null && props.info[props.attack].damageCount > 1) {
        data.push([ i18n.t('metric.projectiles') as string, props.info[props.attack].damageCount.toString() ])
      }
      if (props.info[props.attack].charges != null) {
        data.push([ i18n.t('metric.ammo') as string, props.info[props.attack].charges.toString() ])
      }
      if (props.info[props.attack].spread != null && props.info[props.attack].spread != 0) {
        data.push([ i18n.t('metric.spread') as string, props.info[props.attack].spread + '°' ])
      }
      if (props.info[props.attack].damage != null) {
        data.push([ i18n.t('metric.level1Damage') as string, props.info[props.attack].damage.toString() ])
      }
      if (props.info[props.attack].damage != null) {
        data.push([ i18n.t('metric.level10Damage') as string, Math.round(props.info[props.attack].damage * 1.4).toString() ])
      }

      return data
    })

    const rows = computed(() => table.value.map((r, index) => ({
      title: r[0],
      key: index.toString(),
    })))

    const data = computed(() => table.value.reduce((obj, r, index) => ({
      ...obj,
      [index]: r[1],
    }), {}))

    return {
      rows,
      data,
    }
  },
})
</script>
