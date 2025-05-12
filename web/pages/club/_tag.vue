<template>
  <split-page
    v-if="club != undefined"
    :title="$t('club.meta.title', { club: club.name })"
  >
    <template v-slot:aside-left>
      <club-aside
        id="aside"
        :club="club"
        v-observe-visibility="{
          callback: makeVisibilityCallback('aside'),
          once: true,
        }"
        class="h-auto! max-w-sm"
      ></club-aside>
    </template>

    <b-page-section
      id="description"
      v-observe-visibility="{
        callback: makeVisibilityCallback('description'),
        once: true,
      }"
      :title="$t('club.description')"
    >
      <b-card>
        <template v-slot:content>
          <blockquote class="prose dark:prose-invert italic">
            {{ club.description }}
          </blockquote>
        </template>
      </b-card>
    </b-page-section>

    <ad kind="first"></ad>

    <b-page-section :title="$t('club.members')">
      <club-member-table
        :club="club"
        class="max-w-md"
      ></club-member-table>
    </b-page-section>

    <ad></ad>

    <b-page-section
      id="battles"
      v-observe-visibility="{
        callback: makeVisibilityCallback('battles'),
        once: true,
      }"
      :title="$t('club.common-battle-log')"
    >
      <lazy-battles-list
        v-if="commonBattles.length > 0"
        :battles="commonBattles"
        :highlight-tags="memberTags"
        class="mt-8"
        @interact="trackInteraction('battles')"
      ></lazy-battles-list>
      <b-shimmer
        v-else-if="loading"
        height-px="318"
        loading
      ></b-shimmer>
      <div v-else>
        <p class="prose dark:prose-invert">
          {{ $t('state.no-data') }}
        </p>
        <b-button
          v-if="clubActivityStatistics == undefined"
          v-observe-visibility="{
            callback: loadClubActivityStatistics,
            once: true,
          }"
          class="mt-3"
          primary
          md
          @click="loadClubActivityStatistics()"
        >{{ $t('club.load-activity') }}</b-button>
      </div>
    </b-page-section>

    <b-page-section
      id="retention"
      v-observe-visibility="{
        callback: makeVisibilityCallback('retention'),
        once: true,
      }"
      :title="$t('club.retention.title')"
    >
      <lazy-club-retention-graph
        :loading="loading"
        :club-activity-statistics="clubActivityStatistics"
        class="max-w-md"
      ></lazy-club-retention-graph>
    </b-page-section>

    <ad></ad>

    <b-page-section
      :title="$t('club.member-activity')"
    >
      <club-activity-table
        :loading="loading"
        :club="club"
        :club-activity-statistics="clubActivityStatistics"
        class="max-w-md"
      ></club-activity-table>
    </b-page-section>
  </split-page>
</template>

<script lang="ts">
import { ObserveVisibility } from 'vue-observe-visibility'
import { useApi, useBlockingAsync, useCacheHeaders, useMeta, useSentry } from '~/composables/compat'
import { tagPattern } from '~/lib/util'
import { defineComponent, ref, computed, defineAsyncComponent, hydrateOnVisible } from 'vue'
import { useI18n } from 'vue-i18n'
import { TRPCClientError } from '@trpc/client'
import { BPageSection, BCard, BShimmer } from '@schneefux/klicker/components'
import { useTrackScroll } from '~/composables/gtag'
import { ClubActivityStatistics } from '~/model/Api'
import { injectHead } from '@unhead/vue'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BPageSection,
    BShimmer,
    BCard,
    LazyBattlesList: defineAsyncComponent({
      loader: () => import('~/components/battles-list.vue'),
      hydrate: hydrateOnVisible(),
    }),
    LazyClubRetentionGraph: defineAsyncComponent({
      loader: () => import('~/components/club/club-retention-graph.vue'),
      hydrate: hydrateOnVisible(),
    }),
  },
  async setup() {
    const i18n = useI18n()
    const $api = useApi()
    const sentry = useSentry()
    const head = injectHead()

    useCacheHeaders()

    const memberTags = computed(() => club.value?.members.map(m => m.tag) ?? [])

    const clubActivityStatistics = ref<ClubActivityStatistics>()
    const loading = ref(false)
    const loadClubActivityStatistics = async () => {
      if (loading.value) {
        return
      }

      loading.value = true
      try {
        clubActivityStatistics.value = await $api.club.activityStatisticsByTags.query(memberTags.value)
      } catch (err) {
        sentry.captureException(err)
      }
      loading.value = false
    }

    const club = await useBlockingAsync(async ({ params, redirect, error }) => {
      const tag = (params.tag as string).toUpperCase()
      if (tag != params.tag) {
        // fuck Bing for lowercasing all URLs
        redirect(301, `/club/${tag}`)
        return
      }

      if (!tagPattern.test(tag)) {
        return
      }

      try {
        return await $api.club.byTag.query(tag)
      } catch (err: any) {
        if (err instanceof TRPCClientError) {
          if (err.data?.httpStatus == 404) {
            error({ statusCode: 404, message: i18n.t('error.tag.not-found') })
          }
          if (err.data?.httpStatus >= 400) {
            error({ statusCode: err.data.httpStatus, message: i18n.t('error.api-unavailable') })
          }
        }

        sentry.captureException(err)
        error({ statusCode: 500, message: '' })
      }
    }, 'club')

    useMeta(() => {
      return {
        title: club.value != undefined ? i18n.t('club.meta.title', { club: club.value.name }) : '',
        meta: [ {
          hid: 'description',
          name: 'description',
          content: club.value != undefined ? i18n.t('club.meta.description', { club: club.value.name }) + ' ' + club.value.description : '',
        } ],
      }
    }, head)

    const { makeVisibilityCallback, trackInteraction } = useTrackScroll('club')

    const commonBattles = computed(() => clubActivityStatistics.value?.commonBattles ?? [])

    return {
      club,
      loading,
      memberTags,
      commonBattles,
      trackInteraction,
      makeVisibilityCallback,
      clubActivityStatistics,
      loadClubActivityStatistics,
    }
  },
})
</script>
