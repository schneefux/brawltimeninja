<template>
  <div class="flex flex-wrap justify-around w-full md:w-auto">
    <div class="w-full flex justify-center">
      <div class="w-full max-w-2xl card card--dark md:py-10">
        <div class="card__content max-w-md flex flex-wrap md:flex-nowrap justify-center items-center mx-auto">
          <div class="w-32 md:w-48 md:pr-6 h-64 flex justify-center items-center">
            <media-img
              :path="'/brawlers/' + brawlerId + '/model'"
              :alt="brawlerName"
              size="500"
            ></media-img>
          </div>
          <dl
            v-if="info != null"
            class="w-full"
          >
            <dt class="card__header">{{ brawlerName }}</dt>
            <dd class="card__text mb-3">
              <q class="italic">{{ gamefileDescription }}</q>
              <template v-if="content != null">
                <br>
                {{ content.description || '' }}
              </template>
              <template v-if="generatedDescription != ''">
                <br>
                {{ generatedDescription }}
              </template>
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
        <dd class="card__text mb-3 h-full">
          <q class="italic">{{ info[attack].description }}</q>
          <template v-if="content != null">
            <br>
            {{ content[attack] || '' }}
          </template>
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
        <dd class="card__text mb-3">{{ statisticsDescription }}</dd>
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
import { IContentDocument } from '@nuxt/content/types/content'
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { capitalize, metaStatMaps, scaleInto } from '~/lib/util'
import { BrawlerData } from '~/model/Media'
import { BrawlerContent } from '~/model/Web'

interface Row {
  brawler_name: string
  picks_weighted: number
  battle_victory: number
  battle_starplayer: number
}

function expandContentWithInfo(content: BrawlerContent, info: BrawlerData) {
  function detectGender() {
    const text = info.description.toLowerCase()
    if (text.includes(' she ') || text.includes(' her ')) {
      return 'f'
    }
    if (text.includes(' he ') || text.includes(' his ') || text.includes(' him ')) {
      return 'm'
    }
    return 't'
  }

  function replaceSkillKeys(text: string, skill: 'main'|'super') {
    const formatSeconds = (n: number) => n / 1000 + 's'
    return text
      .replace('$damage', info[skill].damage?.toString() || '')
      .replace('$rechargetime', formatSeconds(info[skill].rechargeTime))
      .replace('$range', info[skill].range?.toString() || '')
  }

  if (content.gender == undefined) {
    content.gender = detectGender()
  }

  if (content.main != undefined) {
    content.main = replaceSkillKeys(content.main, 'main')
  }
  if (content.super != undefined) {
    content.super = replaceSkillKeys(content.super, 'super')
  }

  return content
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
      // game files
      info: null as BrawlerData|null,
      // cms
      content: null as BrawlerContent|null,
      // clicker data
      data: null as Row|null,
      totals: null as Row|null,
    }
  },
  fetchDelay: 0,
  async fetch() {
    const info = await this.$axios.$get<BrawlerData>(`${process.env.mediaUrl}/brawlers/${this.brawlerId}/info`).catch(() => null)
    this.info = info

    let content = await this.$content(`/brawlers/${this.brawlerId}`).fetch().catch(err => null) as BrawlerContent|null

    if (content != null && info != null) {
      content = expandContentWithInfo(content, info)
    }

    this.content = content

    const data = await this.$clicker.query<Row>('meta.brawler.base-stats-widget', 'map',
      ['brawler_name'],
      ['battle_victory', 'battle_starplayer', 'picks_weighted'], {
        ...this.$clicker.defaultSlices('map'),
        brawler_name: [this.brawlerName.toUpperCase()],
      },
      { sort: { picks: 'desc' }, cache: 60*60 })

    const totalData = await this.$clicker.query<Row>('meta.brawler.base-stats-widget', 'map',
      [],
      ['battle_victory', 'battle_starplayer', 'picks_weighted'], {
        ...this.$clicker.defaultSlices('map'),
      },
      { sort: { picks: 'desc' }, cache: 60*60 })

    // TODO use ID
    this.data = data.data[0]
    this.totals = totalData.data[0]
  },
  computed: {
    pronoun(): string {
      if (this.content == undefined) {
        return this.brawlerName
      }

      return {
        'm': 'he',
        'f': 'she',
        't': 'they',
      }[this.content.gender]
    },
    possessivePronoun(): string {
      if (this.content == undefined) {
        return this.brawlerName + '\'s'
      }

      return {
        'm': 'his',
        'f': 'her',
        't': 'their',
      }[this.content.gender]
    },
    gamefileDescription(): string {
      return this.info?.description || ''
    },
    generatedDescription(): string {
      if (this.info == null) {
        return ''
      }
      return `
        ${this.info.class ? `${this.brawlerName} is a ${this.info.class}${this.info.rarity && ` with ${this.info.rarity} Rarity.`}` : (this.info.rarity && `${this.brawlerName}'s Rarity is ${this.info.rarity}.`)}\
        ${capitalize(this.pronoun)} is unlocked ${this.info.unlock ? this.info.unlock == 0 ? `when starting the game` : `upon reaching ${this.info.unlock} Trophies` : `by opening Brawl Boxes`}.
      `.trim()
    },
    statisticsDescription(): string {
      if (this.data == undefined || this.totals == undefined) {
        return ''
      }

      const popularityWords = ['niche', 'not so popular', 'moderately popular', 'very popular']
      const useRate = this.data.picks_weighted / this.totals.picks_weighted
      const popularity = popularityWords[scaleInto(0.02, 0.03, popularityWords.length - 1, useRate)]

      const metanessWords = ['not that good', 'below average', 'average', 'above average', 'excellent']
      const metaness = metanessWords[scaleInto(0.55, 0.60, metanessWords.length - 1, this.data.battle_victory)]

      return `
        ${this.brawlerName} is, judging by ${this.possessivePronoun} Use Rate, a ${popularity} Brawler.\
        Looking at ${this.possessivePronoun} Win Rate, ${this.pronoun} is ${metaness} in the current Meta.
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
