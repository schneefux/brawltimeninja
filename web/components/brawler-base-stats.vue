<template>
  <div class="flex flex-wrap justify-around w-full md:w-auto">
    <div class="w-full flex justify-center">
      <div class="w-full max-w-2xl card card--dark md:py-10">
        <div class="card__content max-w-md flex flex-wrap md:flex-no-wrap justify-center items-center mx-auto">
          <div class="w-32 md:w-48 md:pr-6 h-64 flex justify-center items-center">
            <media-img
              :path="'/brawlers/' + brawlerId + '/model'"
              clazz=""
              size="500"
            ></media-img>
          </div>
          <dl
            v-if="info != null"
            class="w-full"
          >
            <dt class="card__header">{{ brawlerName }}</dt>
            <dd class="card__text mb-3 whitespace-pre-line">{{ brawlerDescription }}</dd>
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
          <div v-else class="w-full"></div>
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
          {{ content[attack] }}
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
      <dl>
        <dt class="card__header">{{ brawlerName }} Statistics</dt>
        <dd class="card__text mb-3 whitespace-pre-line">{{ statisticsDescription }}</dd>
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
import { mapState } from 'vuex'
import { capitalize, metaStatMaps } from '~/lib/util'
import { BrawlerData } from '~/model/Media'

interface Row {
  brawler_name: string
  picks_weighted: number
  battle_victory: number
  battle_starplayer: number
}

interface Content {
  brawler?: string
  main?: string
  super?: string

  gender: string
  pronoun: string
  possessivePronoun: string
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
      content: {
        gender: 't',
        pronoun: 'they',
        possessivePronoun: 'their',
      } as Content,
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.info = await this.$axios.$get<BrawlerData|null>(`${process.env.mediaUrl}/brawlers/${this.brawlerId}/info`).catch(() => null)

    const detectGender = (str: string) => {
      const text = str.toLowerCase()
      if (text.includes(' she ') || text.includes(' her ')) {
        return 'f'
      }
      if (text.includes(' he ') || text.includes(' his ') || text.includes(' him ')) {
        return 'm'
      }
      return 't'
    }

    const pronouns = {
      'm': 'he',
      'f': 'she',
      't': 'they',
    }
    const possessivePronouns = {
      'm': 'his',
      'f': 'her',
      't': 'their',
    }

    const gender = detectGender(this.info?.description || '')
    const content = await this.$content(`/brawlers/${this.brawlerId}`).fetch().catch(err => ({}))
    this.content = {
      gender,
      pronoun: pronouns[gender],
      possessivePronoun: possessivePronouns[gender],
      ...content,
    }

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
    brawlerDescription(): string {
      if (this.info == null) {
        return ''
      }
      return `
        ${this.info.description}
        ${this.info.class ? `${this.brawlerName} is a ${this.info.class}${this.info.rarity && ` with ${this.info.rarity} Rarity.`}` : (this.info.rarity && `${this.brawlerName}'s Rarity is ${this.info.rarity}.`)}\
        ${capitalize(this.content.pronoun)} is unlocked ${this.info.unlock ? this.info.unlock == 0 ? `when starting the game` : `upon reaching ${this.info.unlock} Trophies` : `by opening Brawl Boxes`}.
        ${this.content?.brawler || ''}\
      `
    },
    statisticsDescription(): string {
      if (this.data == undefined || this.totals == undefined) {
        return ''
      }

      const clamp = (min: number, max: number, n: number) => Math.min(max, Math.max(min, n))
      const minMaxScale = (fromMin: number, fromMax: number, n: number) => (n - fromMin) / (fromMax - fromMin)
      const scaleInto = (fromMin: number, fromMax: number, toMax: number, n: number) => clamp(0, toMax, Math.floor(minMaxScale(fromMin, fromMax, n) * toMax))

      const popularityWords = ['niche', 'not so popular', 'moderately popular', 'very popular']
      const useRate = this.data.picks_weighted / this.totals.picks_weighted
      const popularity = popularityWords[scaleInto(0.02, 0.03, popularityWords.length - 1, useRate)]

      const metanessWords = ['not that good', 'below average', 'average', 'above average', 'excellent']
      const metaness = metanessWords[scaleInto(0.55, 0.60, metanessWords.length - 1, this.data.battle_victory)]

      const overallWords = [
        `Unless you know how to play ${this.brawlerName} well, you should pick a different Brawler.`,
        `${this.brawlerName} is not the best choice at the moment.`,
        `Overall, ${this.brawlerName} is a solid pick.`,
        `Playing ${this.brawlerName} is a good Brawler at the moment.`,
        `${this.brawlerName} belongs to the best Brawlers overall.`,
      ]
      const overall = overallWords[scaleInto(0.02*0.55, 0.03*0.60, overallWords.length - 1, useRate * this.data.battle_victory)]

      return `
        ${this.brawlerName} is, judging by ${this.content.possessivePronoun} Use Rate, a ${popularity} Brawler.\
        Looking at ${this.content.possessivePronoun} Win Rate, ${this.content.pronoun} is ${metaness} in the current Meta.\
        ${overall}
      `
    },
    metaStatMaps() {
      return metaStatMaps
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
})
</script>
