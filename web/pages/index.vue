<template>
  <b-page class="flex flex-col justify-center">
    <div class="mx-auto relative">
      <img
        src="~/assets/images/logo_with_crown_min.svg"
        class="mx-auto mt-16 h-32 w-32 md:h-48 md:w-48 lg:h-64 lg:w-64 object-contain"
      >
      <span
        v-if="$i18n.locale != 'en'"
        class="absolute bottom-0 right-0 transform -rotate-12 -mr-10 -mb-3 font-bold text-lg md:text-xl"
      >
        {{ $t('index.now-in-language') }}
      </span>
    </div>

    <b-page-section class="text-center">
      <h1 class="text-4xl font-bold">
        {{ $t('index.title') }}
      </h1>
      <p class="mt-3 text-center text-lg mx-2">
        {{ $t('index.subtitle') }}
      </p>
    </b-page-section>

    <form
      v-observe-visibility="{
        callback: makeVisibilityCallback('section'),
        once: true,
      }"
      :action="`/profile/${cleanedTag}`"
      :target="isInIframe ? '_parent' : ''"
      :onSubmit="isInIframe ? '' : 'return false;'"
      class="mt-10 mx-4 flex flex-wrap justify-center"
      @submit="search"
    >
      <div class="w-full flex justify-center">
        <div class="py-2 border-4 rounded-full border-yellow-400 bg-contrast/10 whitespace-nowrap">
          <input
            v-model="tag"
            :placeholder="$t('action.enter-tag')"
            type="text"
            autocomplete="off"
            class="transition duration-100 ease-in-out form-input w-40 text-lg tracking-wider uppercase placeholder:normal-case font-semibold text-gray-200 bg-transparent focus:ring-0 border-none ml-3 mr-2 py-4 !rounded-full"
          >
          <b-button
            tag="input"
            :value="$t('action.search')"
            type="submit"
            class="shrink-0 mr-3"
            secondary
            round
            lg
          ></b-button>
        </div>
      </div>
      <p
        v-show="loading"
        class="mt-4 text-red-400"
      >
        {{ $t('state.searching') }}…
      </p>
      <p
        v-show="error"
        class="mt-4 text-red-400"
      >
        {{ error }}
      </p>
    </form>

    <b-page-section class="text-center">
      <div class="flex justify-center">
        <details
          ref="helpDropdown"
          class="mx-6"
        >
          <summary>
            {{ $t('tag-help.title') }}
          </summary>
          <b-card
            :title="$t('tag-help.title')"
            class="mt-6 text-left"
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
    </b-page-section>

    <div class="mt-6 mx-6 flex flex-wrap justify-center">
      <div class="mt-2">
        <template v-if="lastPlayers.length === 0">
          {{ $t('index.recommended') }}
        </template>
        <template v-else-if="playerLinks.length > 0">
          {{ $t('index.recents') }}
        </template>
      </div>
      <div class="ml-2">
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

    <ad
      ad-slot="6067985913"
      first
    ></ad>

    <b-page-section
      class="mt-4"
      lazy
    >
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <top-brawlers-card
          v-observe-visibility="{
            callback: makeVisibilityCallback('best_brawlers'),
            once: true,
          }"
          :limit="4"
          :elevation="1"
        ></top-brawlers-card>

        <top-players-card
          v-observe-visibility="{
            callback: makeVisibilityCallback('best_players'),
            once: true,
          }"
          :limit="4"
          :elevation="1"
        ></top-players-card>
      </div>
    </b-page-section>

    <ad
      ad-slot="6709232983"
      lazy
    ></ad>

    <b-page-section
      v-if="events != undefined && events.length > 0"
      :title="$t('index.events.title')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('maps', 'live_events'),
        once: true,
      }"
      lazy
    >
      <events-roll
        :events="events"
        with-data
      ></events-roll>
    </b-page-section>

    <ad
      ad-slot="6736366415"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, useAsync, useContext, useMeta, useRouter, useStore } from '@nuxtjs/composition-api'
import { formatAsJsonLd, tagPattern } from '@/lib/util'
import { Player } from '../model/Brawlstars'
import { useTrackScroll } from '~/composables/gtag'

interface PlayerLink {
  name: string
  tag: string
  link: any
}

export default defineComponent({
  head: {},
  setup() {
    const { i18n, $config, $klicker, $sentry, localePath } = useContext()

    const tag = ref<string|undefined>()
    const events = useAsync(() => $klicker.queryActiveEvents([], {
      powerplay: ['0'],
    }))

    const cleanedTag = computed(() =>
      (tag.value || '')
        .trim()
        .replace('#', '')
        .toUpperCase()
        .replace(/O/g, '0')
    )

    const playerLinks = computed(() => {
      const players = lastPlayers.value.length == 0 ? featuredPlayers.value : lastPlayers.value
      return players
        .slice().sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(p => (<PlayerLink>{
          tag: p.tag,
          name: p.name,
          link: `/profile/${p.tag}`,
        }))
    })

    const isInIframe = ref(false)
    onMounted(() => {
      try {
        isInIframe.value = (<any>global).window === undefined || (<any>global).window.self !== (<any>global).window.top
      } catch (e) {
        isInIframe.value = true
      }
    })

    const { makeVisibilityCallback, gtag } = useTrackScroll('home')

    const store = useStore<any>()
    const player = computed(() => store.state.player as Player|undefined)
    const lastPlayers = computed(() => store.state.lastPlayers)
    const featuredPlayers = computed(() => store.state.featuredPlayers)

    const helpDropdown = ref<HTMLElement>()

    const addLastPlayer = (player: any) => store.commit('addLastPlayer', player)

    const router = useRouter()
    const loading = ref(false)
    const error = ref<string|undefined>()
    const search = async () => {
      error.value = undefined

      if (!tagPattern.test(cleanedTag.value)) {
        gtag.event('search', {
          'event_category': 'player',
          'event_label': 'error_invalid',
        })
        error.value = i18n.tc('error.tag.invalid')
        const dropdown = helpDropdown.value!
        dropdown.setAttribute('open', '')
        dropdown.scrollIntoView({ behavior: 'smooth' })
        return
      }

      try {
        loading.value = true
        await store.dispatch('loadPlayer', cleanedTag.value)
        store.commit('addLastPlayer', player.value)
      } catch (err: any) {
        if (err.response?.status === 404) {
          error.value = i18n.tc('error.tag.not-found')
          gtag.event('search', {
            'event_category': 'player',
            'event_label': 'error_notfound',
          })
        } else if (err.response?.status === 429) {
          error.value = i18n.tc('error.api-unavailable')
          gtag.event('search', {
            'event_category': 'player',
            'event_label': 'error_timeout',
          })
        } else {
          error.value = i18n.tc('error.api-unavailable')
          $sentry.captureException(err)
          gtag.event('search', {
            'event_category': 'player',
            'event_label': 'error_api',
          })
        }
        return
      } finally {
        loading.value = false
      }

      gtag.event('search', {
        'event_category': 'player',
        'event_label': 'success',
      })

      store.commit('setUserTag', cleanedTag.value)

      router.push(localePath(`/profile/${cleanedTag.value}`))
    }

    useMeta(() => {
      const description = i18n.tc('index.meta.description')
      const structuredData = (events.value || [])
        .map((event) => ({
          type: 'application/ld+json',
          json: formatAsJsonLd({
            id: event.id.toString(),
            map: (i18n.te(`map.${event.id}`) && i18n.t(`map.${event.id}`) || event.map) as string,
            mode: i18n.t('mode.' + event.mode) as string,
            start: event.start,
            end: event.end,
          }, $config.mediaUrl),
        }))

      return {
        title: i18n.tc('index.meta.title'),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ],
        script: structuredData,
      }
    })

    return {
      lastPlayers,
      addLastPlayer,
      playerLinks,
      isInIframe,
      helpDropdown,
      makeVisibilityCallback,
      search,
      error,
      tag,
      cleanedTag,
      events,
      loading,
    }
  },
  middleware: ['cached'],
})
</script>

<style scoped lang="postcss">
.placeholder\:normal-case::placeholder {
  @apply normal-case;
}
</style>
