<template>
  <div class="flex flex-wrap justify-around">
    <div class="w-full flex justify-center">
      <div class="w-full max-w-2xl card card--dark md:py-10">
        <div class="card__content max-w-md flex flex-wrap md:flex-no-wrap justify-center items-center mx-auto">
          <media-img
            :path="'/brawlers/' + brawlerId + '/model'"
            clazz="w-32 md:w-48 md:pr-6"
            size="500"
          ></media-img>
          <dl
            v-if="info != null"
            class="w-full"
          >
            <dt class="card__header">{{ brawlerName }}</dt>
            <dd class="card__text mb-3 whitespace-pre-line">
              {{ info.description }}
            </dd>
            <div class="flex justify-between">
              <dt class="font-semibold">Health at Level 1</dt>
              <dd>{{ info.health }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="font-semibold">Health at Level 10</dt>
              <dd>{{ Math.round(info.health * 1.4) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="font-semibold">Speed</dt>
              <dd>{{ Math.round(info.speed * 100) / 100 }} Tiles/s</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div
      v-if="info != null"
      v-for="attack in ['main', 'super']"
      :key="attack"
      class="card card--dark card--sm card__content"
    >
      <dl>
        <dt class="card__header">
          {{ attack == 'main' ? 'Main Attack' : 'Super' }}
        </dt>
        <dd class="card__text mb-3 h-full whitespace-pre-line">
          {{ info[attack].description }}
        </dd>
        <div
          v-if="info[attack].rechargeTime != null"
          class="flex justify-between"
        >
          <dt class="font-semibold">Reload Speed</dt>
          <dd>{{ info[attack].rechargeTime }}ms</dd>
        </div>
        <div
          v-if="info[attack].range != null"
          class="flex justify-between"
        >
          <dt class="font-semibold">Range</dt>
          <dd>{{ info[attack].range.toFixed(1) }} Tiles</dd>
        </div>
        <div
          v-if="info[attack].damageCount != null && info[attack].damageCount > 1"
          class="flex justify-between"
        >
          <dt class="font-semibold">Projectiles</dt>
          <dd>{{ info[attack].damageCount }}</dd>
        </div>
        <div
          v-if="info[attack].charges != null"
          class="flex justify-between"
        >
          <dt class="font-semibold">Ammo</dt>
          <dd>{{ info[attack].charges }}</dd>
        </div>
        <div
          v-if="info[attack].spread != null && info[attack].spread != 0"
          class="flex justify-between"
        >
          <dt class="font-semibold">Spread</dt>
          <dd>{{ info[attack].spread }}°</dd>
        </div>
        <div
          v-if="info[attack].damage != null"
          class="flex justify-between"
        >
          <dt class="font-semibold">{{ info[attack].damageLabel }} at Level 1</dt>
          <dd>{{ info[attack].damage }}</dd>
        </div>
        <div
          v-if="info[attack].damage != null"
          class="flex justify-between"
        >
          <dt class="font-semibold">{{ info[attack].damageLabel }} at Level 10</dt>
          <dd>{{ Math.round(info[attack].damage * 1.4) }}</dd>
        </div>
      </dl>
    </div>

    <div
      v-if="data != null"
      class="card card--dark card--sm card__content"
    >
      <span class="card__header">{{ brawlerName }} Statistics</span>
      <dl class="card__text">
        <div class="flex justify-between">
          <dt class="font-semibold">Use Rate</dt>
          <dd>{{ metaStatMaps.formatters.useRate(data.picks_weighted / totals.picks_weighted) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="font-semibold">Star Rate</dt>
          <dd>{{ metaStatMaps.formatters.starRate(data.battle_starplayer) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="font-semibold">Win Rate</dt>
          <dd>{{ metaStatMaps.formatters.winRate(data.battle_victory) }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps } from '~/lib/util'
import { BrawlerData } from '~/model/Media'

interface Row {
  brawler_name: string
  picks_weighted: number
  battle_victory: number
  battle_starplayer: number
}

export default Vue.extend({
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      info: null as BrawlerData|null,
      data: null as Row|null,
      totals: null as Row|null,
    }
  },
  async fetch() {
    this.info = await this.$axios.$get<BrawlerData|null>(`${process.env.mediaUrl}/brawlers/${this.brawlerId}/info`).catch(() => null)

    const data = await this.$clicker.query<Row>('meta.brawler.base-stats-widget', 'map',
      ['brawler_name'],
      ['battle_victory', 'battle_starplayer', 'picks_weighted'],
      {
        ...this.$clicker.defaultSlices('map'),
      },
      { sort: { picks: 'desc' }, cache: 60*60 })
    // TODO use ID
    this.data = data.data.find(r => r.brawler_name == this.brawlerName.toUpperCase()) || null
    this.totals = data.totals
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
  },
})
</script>
