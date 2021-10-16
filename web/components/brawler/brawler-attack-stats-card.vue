<template>
  <b-card
    :title="attack == 'main' ? $t('brawler.main-attack') : $t('brawler.super-attack')"
    full-height
    md
  >
    <template v-slot:content>
      <p>
        <q class="italic">{{ info[attack].description }}</q>
      </p>
      <kv-table
        :data="table"
        class="mt-3"
      ></kv-table>
    </template>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BrawlerData } from '~/model/Media'

export default Vue.extend({
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
  computed: {
    table(): string[][] {
      const data: string[][] = []
      if (this.info[this.attack].rechargeTime != null) {
        data.push([ this.$i18n.t('metric.reloadSpeed') as string, this.info[this.attack].rechargeTime.toString() + 'ms' ])
      }
      if (this.info[this.attack].range != null) {
        data.push([ this.$i18n.t('metric.range') as string, this.info[this.attack].range.toFixed(1) ])
      }
      if (this.info[this.attack].damageCount != null && this.info[this.attack].damageCount > 1) {
        data.push([ this.$i18n.t('metric.projectiles') as string, this.info[this.attack].damageCount.toString() ])
      }
      if (this.info[this.attack].charges != null) {
        data.push([ this.$i18n.t('metric.ammo') as string, this.info[this.attack].charges.toString() ])
      }
      if (this.info[this.attack].spread != null && this.info[this.attack].spread != 0) {
        data.push([ this.$i18n.t('metric.spread') as string, this.info[this.attack].spread + '°' ])
      }
      if (this.info[this.attack].damage != null) {
        data.push([ this.$i18n.t('metric.level1Damage') as string, this.info[this.attack].damage.toString() ])
      }
      if (this.info[this.attack].damage != null) {
        data.push([ this.$i18n.t('metric.level10Damage') as string, Math.round(this.info[this.attack].damage * 1.4).toString() ])
      }

      return data
    },
  },
})
</script>
