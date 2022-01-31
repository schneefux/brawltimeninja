<template>
  <page class="flex flex-col justify-center">
    <div class="relative">
      <img
        src="~/assets/images/logo_with_crown_min.svg"
        class="mx-auto mt-16 h-32 md:h-48 lg:h-64"
      >
      <span
        v-if="$i18n.locale != 'en'"
        class="absolute bottom-0 right-0 transform -rotate-12 -mr-10 -mb-3 font-bold text-lg md:text-xl"
      >
        {{ $t('index.now-in-language') }}
      </span>
    </div>

    <page-section class="text-center">
      <h1 class="text-4xl font-bold">
        {{ $t('index.title') }}
      </h1>
      <p class="mt-3 text-center text-lg mx-2">
        {{ $t('index.subtitle') }}
      </p>
    </page-section>

    <form
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'search'),
        once: true,
      }"
      class="mt-10 mx-4 flex flex-wrap justify-center"
      :action="`/profile/${cleanedTag}`"
      :target="isInIframe ? '_parent' : ''"
      :onSubmit="isInIframe ? '' : 'return false;'"
      @submit="search"
    >
      <div class="w-full flex justify-center">
        <div class="py-2 border-4 rounded-lg border-yellow-400 bg-gray-800">
          <input
            v-model="tag"
            :placeholder="$t('action.enter-tag')"
            type="text"
            autocomplete="off"
            class="transition duration-100 ease-in-out form-input w-40 md:w-48 text-lg tracking-wider uppercase placeholder:normal-case font-semibold text-gray-200 bg-transparent border-none ml-3 mr-2 focus:ring focus:ring-gray-400 rounded py-2"
          >
          <b-button
            tag="input"
            :value="$t('action.search')"
            type="submit"
            class="shrink-0 mr-3"
            secondary
            lg
          ></b-button>
        </div>
      </div>
      <p
        v-show="loading"
        class="mt-2 text-red-500"
      >
        {{ $t('state.searching') }}…
      </p>
      <p
        v-show="error"
        class="mt-2 font-semibold text-red-500"
      >
        {{ error }}
      </p>
    </form>

    <page-section class="text-center">
      <div class="flex justify-center">
        <details
          ref="help-dropdown"
          class="mx-6"
        >
          <summary>
            {{ $t('tag-help.title') }}
          </summary>
          <b-card
            title="How to find your tag"
            class="mt-6 text-left"
            md
          >
            <div slot="content">
              <p>{{ $t('tag-help.step.1') }}</p>
              <p>{{ $t('tag-help.step.2') }}</p>
              <img
                loading="lazy"
                src="~/assets/images/tag/tag-1.jpg"
                class="px-8 mt-1 w-80 max-w-full"
              >
              <p class="mt-3">{{ $t('tag-help.step.3') }}</p>
              <img
                loading="lazy"
                src="~/assets/images/tag/tag-2.jpg"
                class="px-8 mt-1 w-80 max-w-full"
              >
            </div>
          </b-card>
        </details>
      </div>
    </page-section>

    <div class="mt-6 mx-6 flex flex-wrap justify-center">
      <div class="mt-1">
        <template v-if="lastPlayers.length === 0">
          {{ $t('index.recommended') }}
        </template>
        <template v-if="lastPlayers.length > 0">
          {{ $t('index.recents') }}
        </template>
      </div>
      <div>
        <b-button
          v-for="player in playerLinks"
          :key="player.tag"
          :to="localePath(player.link)"
          @click.native.passive="addLastPlayer(player)"
          xs
          primary
          class="ml-2 mt-1"
        >
          {{ player.name }}
        </b-button>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6067985913"
      />
    </client-only>

    <page-section class="mt-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <top-brawlers-card
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'best_brawlers'),
            once: true,
          }"
          :limit="4"
          :elevation="1"
        ></top-brawlers-card>

        <top-players-card
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'best_players'),
            once: true,
          }"
        ></top-players-card>
      </div>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="mt-10 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6709232983"
      />
    </client-only>

    <page-section
      v-if="events.length > 0"
      :title="$t('index.events.title')"
      tracking-id="live_events"
      tracking-page-id="maps"
    >
      <active-events eager></active-events>
    </page-section>

    <client-only>
      <adsense
        class="mt-8 mb-6 flex justify-center"
        ins-class="w-full"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6736366415"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { formatAsJsonLd } from '@/lib/util'
import { Player } from '../model/Brawlstars'
import { EventMetadata } from '~/plugins/klicker'

interface PlayerLink {
  name: string
  tag: string
  link: any
}

export default Vue.extend({
  head(): MetaInfo {
    const description = this.$tc('index.meta.description')
    const structuredData = this.events
      .map((event) => ({
        type: 'application/ld+json',
        json: formatAsJsonLd({
          id: event.battle_event_id.toString(),
          map: event.battle_event_map,
          mode: this.$t('mode.' + event.battle_event_mode, 'en') as string,
          start: event.start,
          end: event.end,
        }, this.$config.mediaUrl),
      }))

    return {
      title: this.$tc('index.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ],
      script: structuredData,
    }
  },
  meta: {
    title: 'Profile',
    screen: 'profile',
  },
  middleware: ['cached'],
  data() {
    return {
      tag: undefined as string|undefined,
      loading: false,
      error: undefined as string|undefined,
      events: [] as EventMetadata[],
    }
  },
  computed: {
    cleanedTag(): string {
      return (this.tag || '')
        .trim()
        .replace('#', '')
        .toUpperCase()
        .replace(/O/g, '0')
    },
    playerLinks(): PlayerLink[] {
      const players = this.lastPlayers.length == 0 ? this.featuredPlayers : this.lastPlayers
      return players
        .slice().sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(p => (<PlayerLink>{
          tag: p.tag,
          name: p.name,
          link: `/profile/${p.tag}`,
        }))
    },
    isInIframe(): boolean {
      try {
        return (<any>global).window === undefined || (<any>global).window.self !== (<any>global).window.top
      } catch (e) {
        return true
      }
    },
    ...mapState({
      player: (state: any) => state.player as Player,
      userTag: (state: any) => state.userTag as undefined|string,
      tagPattern: (state: any) => state.tagPattern as string,
      lastPlayers: (state: any) => state.lastPlayers,
      featuredPlayers: (state: any) => state.featuredPlayers,
      isApp: (state: any) => state.isApp as boolean,
      cookiesAllowed: (state: any) => state.cookiesAllowed as boolean,
    }),
  },
  fetchDelay: 0,
  async fetch() {
    this.events = await this.$klicker.queryActiveEvents()
  },
  methods: {
    async search() {
      this.error = undefined

      const tagRegex = new RegExp(this.tagPattern)

      if (!tagRegex.test(this.cleanedTag)) {
        this.$gtag.event('search', {
          'event_category': 'player',
          'event_label': 'error_invalid',
        })
        this.error = this.$tc('error.tag.invalid')
        const dropdown = this.$refs['help-dropdown'] as HTMLElement
        dropdown.setAttribute('open', '')
        // key events would cancel scroll
        this.$scrollTo(dropdown, 1000, { cancelable: false, offset: -300 })
        return
      }

      try {
        this.loading = true
        await this.$store.dispatch('loadPlayer', this.cleanedTag)
        this.addLastPlayer(this.player)
      } catch (error: any) {
        if (error.response?.status === 404) {
          this.$gtag.event('search', {
            'event_category': 'player',
            'event_label': 'error_notfound',
          })
          this.error = this.$tc('error.tag.not-found')
        } else if (error.response?.status === 429) {
          this.$gtag.event('search', {
            'event_category': 'player',
            'event_label': 'error_timeout',
          })
          this.error = this.$tc('error.api-unavailable')
        } else {
          this.$sentry.captureException(error)
          this.$gtag.event('search', {
            'event_category': 'player',
            'event_label': 'error_api',
          })
          this.error = this.$tc('error.api-unavailable')
        }
        return
      } finally {
        this.loading = false
      }

      this.$gtag.event('search', {
        'event_category': 'player',
        'event_label': 'success',
      })
      if (this.cookiesAllowed) {
        document.cookie = `usertag=${this.cleanedTag}; expires=${new Date(Date.now() + 365*24*60*60*1000)}`
      }
      this.$router.push(this.localePath(`/profile/${this.cleanedTag}`))
    },
    trackScroll(visible, element, section) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'home',
          'event_label': section,
        })
      }
    },
    ...mapMutations({
      addLastPlayer: 'addLastPlayer',
    }),
  },
})
</script>

<style scoped lang="postcss">
.placeholder\:normal-case::placeholder {
  @apply normal-case;
}
</style>
