<template>
  <div
    ref="container"
    class="ml-4 inline-flex items-center"
  >
    <font-awesome-icon
      :icon="faSearch"
      class="-mr-6"
    ></font-awesome-icon>
    <b-textbox
      v-model="filter"
      ref="search"
      :class="inputClass"
      type="text"
      class="pl-8 h-6 w-full"
      @focus="showNavigator = true"
      @keyup.native.enter="goToFirstResult"
    ></b-textbox>

    <b-card
      v-if="showNavigator"
      ref="popup"
      :elevation="0"
      :title="$t('nav.Menu')"
      class="top-14 bottom-14 lg:bottom-0 absolute h-[calc(100vh-2*3.5rem)] lg:h-[calc(100vh-3.5rem)] inset-x-0 w-screen z-10 lg:max-w-md"
    >
      <b-navigator
        slot="content"
        ref="navigator"
        :links="linkTree"
        :link-generator="linkGenerator"
        :search="filter"
        class="h-full pb-14 overflow-y-auto overscroll-contain"
      >
        <template v-slot:link="{ to, title }">
          <nuxt-link
            :to="to"
            class="underline col-start-2"
          >{{ title }}</nuxt-link>
        </template>
      </b-navigator>
      <button
        slot="preview"
        class="text-xl h-6 w-6"
        aria-label="close"
        @click="showNavigator = false"
      >
        <font-awesome-icon
          :icon="faTimes"
        ></font-awesome-icon>
      </button>
    </b-card>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useAsync, useContext, useRoute, useRouter, watch } from '@nuxtjs/composition-api'
import { Link } from '@schneefux/klicker/components/ui/b-navigator.vue'
import { BTextbox, BCard, BNavigator } from '@schneefux/klicker/components'
import { getMapName } from '~/composables/map'
import { brawlerId, camelToKebab, capitalizeWords, slugify, tagPattern } from '~/lib/util'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { requestStatic } from '~/composables/content'
import { TocEntry } from '~/model/Web'

export default defineComponent({
  props: {
    inputClass: {
      type: String,
      default: '',
    },
  },
  components: {
    BTextbox,
    BCard,
    BNavigator,
  },
  setup() {
    const { $klicker, i18n, localePath } = useContext()
    const brawlers = useAsync(() => $klicker.queryAllBrawlers(), 'all-brawlers')
    const modes = useAsync(() => $klicker.queryAllModes(), 'all-modes')
    const maps = useAsync(() => $klicker.queryAllEvents(), 'all-events')
    const toc = useAsync<TocEntry[]>(() => requestStatic('content/guides/toc.json').then(r => JSON.parse(r)), 'toc-guides')

    const mapViewTabs = ['brawlers', 'starpowers', 'gadgets', 'gears', 'leaderboard']

    const linkTree = computed<Link[]>(() => {
      return [{
        id: 'brawlers',
        name: i18n.t('nav.Brawlers') as string,
        target: localePath(`/tier-list/brawler`),
        children: (<Link[]> []).concat(
          mapViewTabs.map(tab => ({
            id: `brawlers#${tab}`,
            name: i18n.t('tab.' + tab) as string,
            target: localePath(`/tier-list/brawler#${tab}`),
          })),
          (brawlers.value ?? []).map(b => ({
            id: b,
            name: capitalizeWords(b.toLowerCase()),
            target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}`),
            children: [{
              id: `${b}#overview`,
              name: i18n.t('brawler.overview') as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#overview`),
            }, {
              id: `${b}#accessory`,
              name: i18n.t('brawler.accessories') as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#accessory`),
            }, {
              id: `${b}#synergy`,
              name: i18n.t('brawler.synergies-and-weaknesses-for', { brawler: b }) as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#synergy`),
            }, {
              id: `${b}#maps`,
              name: i18n.t('brawler.current-maps.title', { brawler: capitalizeWords(b.toLowerCase()) }) as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#maps`),
            }, {
              id: `${b}#modes`,
              name: i18n.t('brawler.modes.title', { brawler: capitalizeWords(b.toLowerCase()) }) as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#modes`),
            }, {
              id: `${b}#trends`,
              name: i18n.t('brawler.trends', { brawler: capitalizeWords(b.toLowerCase()) }) as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#trends`),
            }, {
              id: `${b}#trophies`,
              name: i18n.t('brawler.by-trophies', { brawler: capitalizeWords(b.toLowerCase()) }) as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#trophies`),
            }, {
              id: `${b}#skins`,
              name: i18n.tc('skin', 2) as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#skins`),
            }, {
              id: `${b}#pins`,
              name: i18n.tc('pin', 2) as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#pins`),
            }, {
              id: `${b}#voicelines`,
              name: i18n.tc('voiceline', 2) as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#voicelines`),
            }, {
              id: `${b}#balance`,
              name: i18n.t('balance-changes') as string,
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b })}#balance`),
            }],
          })),
        ),
      }, {
        id: 'events',
        name: i18n.t('nav.Events') as string,
        target: localePath('/tier-list/map'),
        children: (<Link[]> []).concat(
          [{
            id: 'events-active',
            name: i18n.t('events.active.title') as string,
            target: localePath(`/tier-list/map#active`),
          }, {
            id: 'events-powerleague',
            name: i18n.t('events.powerleague.title') as string,
            target: localePath(`/tier-list/map#powerleague`),
          }, {
            id: 'events-upcoming',
            name: i18n.t('events.upcoming.title') as string,
            target: localePath(`/tier-list/map#upcoming`),
          }, {
            id: 'events-season',
            name: i18n.t('events.season.title') as string,
            target: localePath(`/tier-list/map#season`),
          }, {
            id: 'events-competition-winners',
            name: i18n.t('tier-list.competition-winners.title') as string,
            target: localePath(`/tier-list/map#competition-winners`),
          }],
          (modes.value ?? []).map(m => ({
            id: m,
            name: i18n.t('mode.' + m) as string,
            target: localePath(`/tier-list/mode/${m}`),
            children: (<Link[]> []).concat(
              mapViewTabs.map(tab => ({
                id: `${m}#${tab}`,
                name: i18n.t('tab.' + tab) as string,
                target: localePath(`/tier-list/mode/${camelToKebab(m)}/#${tab}`),
              })),
              (maps.value ?? [])
                .filter(e => e.mode == m)
                .map(e => ({
                  id: e.key,
                  name: getMapName(i18n, e.id, e.map) as string,
                  target: localePath(`/tier-list/mode/${camelToKebab(m)}/map/${slugify(e.map)}`),
                  children: mapViewTabs.map(tab => ({
                    id: `${e.key}#${tab}`,
                    name: i18n.t('tab.' + tab) as string,
                    target: localePath(`/tier-list/mode/${camelToKebab(m)}/map/${slugify(e.map)}#${tab}`),
                  })),
                })),
            ),
          })),
        )
      }, {
        id: 'leaderboards',
        name: i18n.t('nav.Leaderboards') as string,
        children: ['hours', 'trophies', 'victories', 'soloVictories', 'duoVictories'].map(metric => ({
          id: metric,
          name: i18n.t('metric.' + metric) as string,
          target: localePath(`/leaderboard/${metric}`),
        }))
      }, {
        id: 'guides',
        name: i18n.t('nav.Guides') as string,
        target: localePath('/blog/guides'),
        children: (toc.value ?? []).map(post => ({
          id: post.slug,
          name: post.title,
          target: `/blog/guides/${post.slug}`,
        })),
      }, {
        id: 'starpowers',
        name: i18n.t('nav.Star Powers') as string,
        target: localePath('/tier-list/starpowers'),
      }, {
        id: 'gadgets',
        name: i18n.t('nav.Gadgets') as string,
        target: localePath('/tier-list/gadgets'),
      }, {
        id: 'gears',
        name: i18n.t('nav.Gears') as string,
        target: localePath('/tier-list/gears'),
      }, {
        id: 'dashboard',
        name: i18n.t('nav.Dashboard') as string,
        target: localePath('/dashboard'),
      }, {
        id: 'teambuilder',
        name: i18n.t('nav.Team Builder') as string,
        target: localePath('/team-builder'),
      }, {
        id: 'quiz',
        name: i18n.t('nav.Quiz') as string,
        target: localePath('/quiz'),
      }, {
        id: 'brawlerrecords',
        name: i18n.t('nav.Brawler Records') as string,
        target: localePath('/brawler-records'),
      }, {
        id: 'barchartrace',
        name: i18n.t('nav.Bar Chart Race') as string,
        target: localePath('/bar-chart-race'),
      }, {
        id: 'about',
        name: i18n.t('nav.About') as string,
        target: localePath('/about'),
      }, {
        id: 'status',
        name: i18n.t('nav.Status') as string,
        target: localePath('/status'),
      }]
    })

    const linkGenerator = (input: string): Link[] => {
      const tagCandidate = input.toUpperCase().replace('#', '')
      if (tagPattern.test(tagCandidate)) {
        return [{
          id: `profile-${tagCandidate}`,
          name: `${i18n.t('nav.Profile') as string} #${tagCandidate}`,
          target: localePath(`/profile/${tagCandidate}`),
          children: [{
            id: `profile-${tagCandidate}-time`,
            name: i18n.t('player.time-statistics') as string,
            target: localePath(`/profile/${tagCandidate}#time`),
          }, {
            id: `profile-${tagCandidate}-trophy`,
            name: i18n.t('player.trophy-statistics') as string,
            target: localePath(`/profile/${tagCandidate}#trophy`),
          }, {
            id: `profile-${tagCandidate}-records`,
            name: i18n.t('player.records.title') as string,
            target: localePath(`/profile/${tagCandidate}#records`),
          }, {
            id: `profile-${tagCandidate}-battles`,
            name: i18n.t('battle-log') as string,
            target: localePath(`/profile/${tagCandidate}#battles`),
          }, {
            id: `profile-${tagCandidate}-modes`,
            name: i18n.tc('mode', 2) as string,
            target: localePath(`/profile/${tagCandidate}#modes`),
          }, {
            id: `profile-${tagCandidate}-brawlers`,
            name: i18n.tc('brawler', 2) as string,
            target: localePath(`/profile/${tagCandidate}#brawlers`),
          }]
        }, {
          id: `club-${tagCandidate}`,
          name: `${i18n.t('nav.Club') as string} #${tagCandidate}`,
          target: localePath(`/club/${tagCandidate}`),
        }]
      }

      return []
    }

    const filter = ref('')
    const showNavigator = ref(false)

    const route = useRoute()

    watch(route, () => {
      showNavigator.value = false
      filter.value = ''
    })

    const popup = ref<typeof BCard>()
    const container = ref<HTMLElement>()
    onClickOutside(popup as any, () => showNavigator.value = false, {
      ignore: [container as any],
    })

    const search = ref<InstanceType<typeof BTextbox>>()
    onKeyStroke(
      (event) => (event.metaKey || event.ctrlKey) && event.key == 'k',
      () => {
        showNavigator.value = true;
        (search.value!.$el as HTMLInputElement).focus()
      },
    )

    const navigator = ref<InstanceType<typeof BNavigator>>()
    const router = useRouter()
    const goToFirstResult = () => {
      if (navigator.value == undefined) {
        return
      }

      const firstLink = navigator.value.searchResults
        .concat(linkTree.value)
        .find(l => l.target != undefined)

      if (firstLink != undefined) {
        router.push(firstLink.target!)
      }
    }

    return {
      navigator,
      container,
      popup,
      search,
      filter,
      showNavigator,
      linkTree,
      linkGenerator,
      faSearch,
      faTimes,
      goToFirstResult,
    }
  },
})
</script>
