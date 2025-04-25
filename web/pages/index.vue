<template>
  <split-page>
    <b-page-section id="title">
      <div class="w-full max-w-lg md:mx-auto space-y-4 flex flex-col md:items-center">
        <div class="w-full">
        <img
          :src="logoWithCrownUrl"
          alt="Logo"
          class="float-right h-18 w-18 object-contain"
        >

        <h1 class="mb-2 text-3xl font-bold">
          {{ $t('index.title') }}
        </h1>

        <p class="text-lg">
          {{ $t('index.subtitle') }}
        </p>
        </div>

        <form
          id="search"
          v-observe-visibility="{
            callback: makeVisibilityCallback('section'),
            once: true,
          }"
          :action="`/profile/${cleanedTag}`"
          @submit.prevent="search"
        >
          <div class="w-full flex">
            <div class="py-2 border-4 rounded-full border-primary-400 bg-contrast/10 whitespace-nowrap">
              <input
                v-model="tag"
                :placeholder="$t('action.enter-tag')"
                type="text"
                autocomplete="off"
                class="transition duration-100 ease-in-out form-input w-40 text-lg tracking-wider uppercase placeholder:normal-case font-semibold text-gray-200 bg-transparent focus:ring-0 border-none ml-3 mr-2 py-4 rounded-full!"
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

        <div id="recommended" class="flex flex-wrap">
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

        <details
          id="help"
          ref="helpDropdown"
        >
          <summary>
            {{ $t('tag-help.title') }}
          </summary>
          <b-card
            :title="$t('tag-help.title')"
            class="mt-4"
          >
            <template v-slot:content>
              <ol class="space-y-4 list-decimal list-inside">
                <li>
                  <b-button
                    tag="a"
                    href="https://link.brawlstars.com/"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    class="ml-2"
                    primary
                    xs
                  >
                    {{ $t('tag-help.step.1') }}
                  </b-button>
                </li>
                <li>
                  {{ $t('tag-help.step.2') }}
                  <img
                    loading="lazy"
                    :src="tag1Url"
                    class="px-6 mt-2 w-80 max-w-full"
                  >
                </li>
                <li>
                  {{ $t('tag-help.step.3') }}
                  <img
                    loading="lazy"
                    :src="tag2Url"
                    class="px-6 mt-2 w-80 max-w-full"
                  >
                </li>
              </ol>
            </template>
          </b-card>
        </details>
      </div>
    </b-page-section>

    <ad kind="first"></ad>

    <b-page-section
      id="best"
      lazy
    >
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <top-brawlers-card
          id="top-brawlers"
          v-observe-visibility="{
            callback: makeVisibilityCallback('best_brawlers'),
            once: true,
          }"
          :limit="4"
          :elevation="1"
        ></top-brawlers-card>

        <top-players-card
          id="top-players"
          v-observe-visibility="{
            callback: makeVisibilityCallback('best_players'),
            once: true,
          }"
          :limit="4"
          :elevation="1"
        ></top-players-card>
      </div>
    </b-page-section>

    <ad></ad>

    <b-page-section
      id="events"
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
  </split-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useTemplateRef } from 'vue'
import { ObserveVisibility } from 'vue-observe-visibility'
import { tagPattern } from '~/lib/util'
import { useTrackScroll } from '~/composables/gtag'
import { TRPCClientError } from '@trpc/client'
import { useMeta, useCacheHeaders, useLocalePath, useSentry } from '~/composables/compat'
import { useActiveEvents } from '~/composables/dimension-values'
import { useBrawlstarsStore } from '~/stores/brawlstars'
import { event } from 'vue-gtag'
import logoWithCrownUrl from '~/assets/images/logo.min.svg'
import tag1Url from '~/assets/images/tag/tag-1.jpg'
import tag2Url from '~/assets/images/tag/tag-2.jpg'
import { useRouter } from 'vue-router'
import { usePreferences } from '~/stores/preferences'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  setup() {
    const i18n = useI18n()
    const localePath = useLocalePath()
    const sentry = useSentry()

    const tag = ref<string|undefined>()
    const events = useActiveEvents([], {
      powerplay: ['false'],
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

    const { state, addLastPlayer, setUserTag } = usePreferences()

    const lastPlayers = computed(() => state.value.lastPlayers
      .slice(0, 3)
      .map(mapToPlayerLink))

    const brawlstarsStore = useBrawlstarsStore()
    const featuredPlayers = computed(() => brawlstarsStore.featuredPlayers
      .slice(0, 3)
      .map(mapToPlayerLink))

    const { makeVisibilityCallback } = useTrackScroll('home')

    const helpDropdownRef = useTemplateRef<HTMLElement>('helpDropdown')

    const router = useRouter()
    const loading = ref(false)
    const error = ref<string|undefined>()
    const search = async () => {
      error.value = undefined

      if (!tagPattern.test(cleanedTag.value)) {
        event('search_tag_invalid', {})
        error.value = i18n.t('error.tag.invalid')
        const dropdown = helpDropdownRef.value!
        dropdown.setAttribute('open', '')
        dropdown.scrollIntoView({ behavior: 'smooth' })
        return
      }

      try {
        loading.value = true
        await brawlstarsStore.loadPlayer(cleanedTag.value)
        addLastPlayer(brawlstarsStore.player!)
      } catch (err) {
        if (err instanceof TRPCClientError) {
          if (err.data?.httpStatus == 404) {
            error.value = i18n.t('error.tag.not-found')
            event('search_not_found', {})
            return
          }
          if (err.data?.httpStatus >= 400) {
            error.value = i18n.t('error.api-unavailable')
            event('search_timeout', {})
            return
          }
        }

        error.value = i18n.t('error.api-unavailable')
        sentry.captureException(err)
        event('search_api_error', {})
        return
      } finally {
        loading.value = false
      }

      event('search_success', {})

      setUserTag(cleanedTag.value)

      await router.push(localePath(`/profile/${cleanedTag.value}`))
    }

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('index.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('index.meta.description') },
      ],
    }))

    return {
      lastPlayers,
      featuredPlayers,
      addLastPlayer,
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
