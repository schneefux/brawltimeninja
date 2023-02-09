<template>
  <b-page>
    <ad
      class="-mt-6 mb-6 mx-auto"
      ad-slot="2812773083"
      banner
    ></ad>

    <div class="flex flex-col justify-center">
      <div class="mx-auto relative">
        <img
          :src="logoWithCrownUrl"
          class="mx-auto mt-2 h-32 w-32 md:h-48 md:w-48 lg:h-64 lg:w-64 object-contain"
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
        class="mt-4 mx-4 flex flex-wrap justify-center"
        @submit.prevent="search"
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
              type="submit"
              class="shrink-0 mr-3"
              secondary
              round
              lg
            >{{ $t('action.search') }}</b-button>
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

      <div class="mt-4 mx-6 flex justify-center">
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
              <template v-slot:content>
                <div>
                  <p>{{ $t('tag-help.step.1') }}</p>
                  <p>{{ $t('tag-help.step.2') }}</p>
                  <img
                    loading="lazy"
                    :src="tag1Url"
                    class="px-8 mt-1 w-80 max-w-full"
                  >
                  <p class="mt-3">{{ $t('tag-help.step.3') }}</p>
                  <img
                    loading="lazy"
                    :src="tag2Url"
                    class="px-8 mt-1 w-80 max-w-full"
                  >
                </div>
              </template>
            </b-card>
          </details>
        </div>
      </div>

      <div class="mt-2 mx-6 flex flex-wrap justify-center">
        <div class="mt-2">
          <template v-if="lastPlayers.length === 0">
            {{ $t('index.recommended') }}
          </template>
          <template v-else-if="featuredPlayers.length > 0">
            {{ $t('index.recents') }}
          </template>
        </div>
        <div class="ml-2">
          <b-button
            v-for="player in (lastPlayers.length > 0 ? lastPlayers : featuredPlayers)"
            :key="player.tag"
            :to="player.link"
            class="ml-2 mt-1"
            xs
            primary
            @click.passive="addLastPlayer(player)"
          >
            {{ player.name }}
          </b-button>
        </div>
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
        callback: makeVisibilityCallback('live_events'),
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
import { computed, defineComponent, ref } from 'vue'
import { ObserveVisibility } from 'vue-observe-visibility'
import { formatAsJsonLd, tagPattern } from '@/lib/util'
import { useTrackScroll } from '~/composables/gtag'
import { TRPCClientError } from '@trpc/client'
import { useMeta, useCacheHeaders, useLocalePath, useConfig, useSentry } from '@/composables/compat'
import { useActiveEvents } from '@/composables/dimension-values'
import { useBrawlstarsStore } from '@/stores/brawlstars'
import { event } from 'vue-gtag'
import logoWithCrownUrl from '~/assets/images/logo_with_crown_min.svg'
import tag1Url from '~/assets/images/tag/tag-1.jpg'
import tag2Url from '~/assets/images/tag/tag-2.jpg'
import { useRouter } from 'vue-router'
import { usePreferencesStore } from '@/stores/preferences'
import { useI18n } from 'vue-i18n'

interface PlayerLink {
  name: string
  tag: string
  link: any
}

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  setup() {
    const i18n = useI18n()
    const $config = useConfig()
    const localePath = useLocalePath()
    const sentry = useSentry()

    const tag = ref<string|undefined>()
    const events = useActiveEvents([], {
      powerplay: ['0'],
    })

    const cleanedTag = computed(() =>
      (tag.value || '')
        .trim()
        .replace('#', '')
        .toUpperCase()
        .replace(/O/g, '0')
    )

    const mapToPlayerLink = (p: { tag: string, name: string }) => ({
      tag: p.tag,
      name: p.name,
      link: localePath(`/profile/${p.tag.replace(/^#/, '')}`),
    })

    const preferencesStore = usePreferencesStore()

    const lastPlayers = computed(() => preferencesStore.lastPlayers
      .slice(0, 3)
      .map(mapToPlayerLink))

    const brawlstarsStore = useBrawlstarsStore()
    const featuredPlayers = computed(() => brawlstarsStore.featuredPlayers
      .slice(0, 3)
      .map(mapToPlayerLink))

    const { makeVisibilityCallback } = useTrackScroll('home')

    const helpDropdown = ref<HTMLElement>()

    const addLastPlayer = (player: PlayerLink) => preferencesStore.addLastPlayer(player)

    const router = useRouter()
    const loading = ref(false)
    const error = ref<string|undefined>()
    const search = async () => {
      error.value = undefined

      if (!tagPattern.test(cleanedTag.value)) {
        event('search', {
          'event_category': 'player',
          'event_label': 'error_invalid',
        })
        error.value = i18n.t('error.tag.invalid')
        const dropdown = helpDropdown.value!
        dropdown.setAttribute('open', '')
        dropdown.scrollIntoView({ behavior: 'smooth' })
        return
      }

      try {
        loading.value = true
        await brawlstarsStore.loadPlayer(cleanedTag.value)
        preferencesStore.addLastPlayer(brawlstarsStore.player!)
      } catch (err) {
        if (err instanceof TRPCClientError) {
          if (err.data?.httpStatus == 404) {
            error.value = i18n.t('error.tag.not-found')
            event('search', {
              'event_category': 'player',
              'event_label': 'error_notfound',
            })
            return
          }
          if (err.data?.httpStatus >= 400) {
            error.value = i18n.t('error.api-unavailable')
            event('search', {
              'event_category': 'player',
              'event_label': 'error_timeout',
            })
            return
          }
        }

        error.value = i18n.t('error.api-unavailable')
        sentry.captureException(err)
        event('search', {
          'event_category': 'player',
          'event_label': 'error_api',
        })
        return
      } finally {
        loading.value = false
      }

      event('search', {
        'event_category': 'player',
        'event_label': 'success',
      })

      preferencesStore.userTag = cleanedTag.value

      router.push(localePath(`/profile/${cleanedTag.value}`))
    }

    useCacheHeaders()
    useMeta(() => {
      const structuredData = (events.value || [])
        .map((event) => ({
          type: 'application/ld+json',
          innerHTML: formatAsJsonLd({
            id: event.id.toString(),
            map: (i18n.te(`map.${event.id}`) && i18n.t(`map.${event.id}`) || event.map),
            mode: i18n.t('mode.' + event.mode),
            start: event.start,
            end: event.end,
          }, $config.mediaUrl),
        }))

      return {
        title: i18n.t('index.meta.title'),
        meta: [
          { hid: 'description', name: 'description', content: i18n.t('index.meta.description') },
        ],
        script: structuredData,
      }
    })

    return {
      lastPlayers,
      featuredPlayers,
      addLastPlayer,
      helpDropdown,
      makeVisibilityCallback,
      search,
      error,
      tag,
      cleanedTag,
      events,
      loading,
      logoWithCrownUrl,
      tag1Url,
      tag2Url,
    }
  },
})
</script>

<style scoped lang="postcss">
.placeholder\:normal-case::placeholder {
  @apply normal-case;
}
</style>
