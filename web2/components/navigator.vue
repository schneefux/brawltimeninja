<template>
  <b-search
    ref="search"
    v-model="popupOpen"
    :input-class="inputClass"
    container-class=""
    popup-class="top-14 bottom-14 lg:bottom-0 h-[calc(100vh-2*3.5rem)] lg:h-[calc(100vh-3.5rem)] w-screen lg:max-w-md"
    @enter="goToFirstResult"
  >
    <template v-slot="{ query }">
      <b-card
        :elevation="0"
        :title="$t('nav.Menu')"
      >
        <template v-slot:content>
          <b-navigator
            ref="navigator"
            :links="linkTree"
            :link-generator="linkGenerator"
            :search="query"
            class="h-full pb-14 overflow-y-auto overscroll-contain"
          >
            <template v-slot:link="{ to, title }">
              <router-link
                :to="to"
                class="underline col-start-2"
              >{{ title }}</router-link>
            </template>
          </b-navigator>
        </template>
        <template v-slot:preview>
          <button
            class="text-xl h-6 w-6"
            aria-label="close"
            @click="popupOpen = false"
          >
            <font-awesome-icon
              :icon="faTimes"
            ></font-awesome-icon>
          </button>
        </template>
      </b-card>
    </template>
  </b-search>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { Link } from '@schneefux/klicker/components/ui/b-navigator.vue'
import { BCard, BNavigator, BSearch } from '@schneefux/klicker/components'
import { getMapName } from '~/composables/map'
import { brawlerId, camelToKebab, slugify, tagPattern } from '~/lib/util'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { TocEntry } from '~/model/Web'
import { useAsync, useLocalePath } from '@/composables/compat'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useAllBrawlers, useAllEvents, useAllModes } from '@/composables/dimension-values'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    BSearch,
    BCard,
    BNavigator,
    FontAwesomeIcon,
  },
  props: {
    inputClass: {
      type: String,
      default: '',
    },
  },
  setup() {
    const i18n = useI18n()
    const localePath = useLocalePath()
    const brawlers = useAllBrawlers()
    const modes = useAllModes()
    const maps = useAllEvents()
    const toc = useAsync<{ default: TocEntry[] }>(() => import('~/assets/content/guides/toc.json'), 'toc-guides')

    const mapViewTabs = ['brawlers', 'starpowers', 'gadgets', 'gears', 'leaderboard']

    const linkTree = computed<Link[]>(() => {
      return [{
        id: 'brawlers',
        name: i18n.t('nav.Brawlers'),
        target: `/tier-list/brawler`,
        children: (<Link[]> []).concat(
          mapViewTabs.map(tab => ({
            id: `brawlers#${tab}`,
            name: i18n.t('tab.' + tab),
            target: localePath(`/tier-list/brawler#${tab}`),
          })),
          (brawlers.value ?? []).map(b => ({
            id: b.id,
            name: b.name,
            target: `/tier-list/brawler/${brawlerId({ name: b.id })}`,
            children: [{
              id: `${b.id}#overview`,
              name: i18n.t('brawler.overview'),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#overview`),
            }, {
              id: `${b.id}#accessory`,
              name: i18n.t('brawler.accessories'),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#accessory`),
            }, {
              id: `${b.id}#synergy`,
              name: i18n.t('brawler.synergies-and-weaknesses-for', { brawler: b }),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#synergy`),
            }, {
              id: `${b.id}#maps`,
              name: i18n.t('brawler.current-maps.title', { brawler: b.name }),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#maps`),
            }, {
              id: `${b.id}#modes`,
              name: i18n.t('brawler.modes.title', { brawler: b.name }),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#modes`),
            }, {
              id: `${b.id}#trends`,
              name: i18n.t('brawler.trends', { brawler: b.name }),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#trends`),
            }, {
              id: `${b.id}#trophies`,
              name: i18n.t('brawler.by-trophies', { brawler: b.name }),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#trophies`),
            }, {
              id: `${b.id}#skins`,
              name: i18n.t('skin', 2),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#skins`),
            }, {
              id: `${b.id}#pins`,
              name: i18n.t('pin', 2),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#pins`),
            }, {
              id: `${b.id}#voicelines`,
              name: i18n.t('voiceline', 2),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#voicelines`),
            }, {
              id: `${b.id}#balance`,
              name: i18n.t('balance-changes'),
              target: localePath(`/tier-list/brawler/${brawlerId({ name: b.id })}#balance`),
            }],
          })),
        ),
      }, {
        id: 'events',
        name: i18n.t('nav.Events'),
        target: localePath('/tier-list/map'),
        children: (<Link[]> []).concat(
          [{
            id: 'events-active',
            name: i18n.t('events.active.title'),
            target: localePath(`/tier-list/map#active`),
          }, {
            id: 'events-powerleague',
            name: i18n.t('events.powerleague.title'),
            target: localePath(`/tier-list/map#powerleague`),
          }, {
            id: 'events-upcoming',
            name: i18n.t('events.upcoming.title'),
            target: localePath(`/tier-list/map#upcoming`),
          }, {
            id: 'events-season',
            name: i18n.t('events.season.title'),
            target: localePath(`/tier-list/map#season`),
          }, {
            id: 'events-competition-winners',
            name: i18n.t('tier-list.competition-winners.title'),
            target: localePath(`/tier-list/map#competition-winners`),
          }],
          modes.value.map(m => ({
            id: m,
            name: i18n.t('mode.' + m),
            target: localePath(`/tier-list/mode/${m}`),
            children: (<Link[]> []).concat(
              mapViewTabs.map(tab => ({
                id: `${m}#${tab}`,
                name: i18n.t('tab.' + tab),
                target: localePath(`/tier-list/mode/${camelToKebab(m)}/#${tab}`),
              })),
              maps.value
                .filter(e => e.mode == m)
                .map(e => ({
                  id: e.key,
                  name: getMapName(e.id, e.map)!,
                  target: localePath(`/tier-list/mode/${camelToKebab(m)}/map/${slugify(e.map)}`),
                  children: mapViewTabs.map(tab => ({
                    id: `${e.key}#${tab}`,
                    name: i18n.t('tab.' + tab),
                    target: localePath(`/tier-list/mode/${camelToKebab(m)}/map/${slugify(e.map)}#${tab}`),
                  })),
                })),
            ),
          })),
        )
      }, {
        id: 'leaderboards',
        name: i18n.t('nav.Leaderboards'),
        children: ['hours', 'trophies', 'victories', 'soloVictories', 'duoVictories'].map(metric => ({
          id: metric,
          name: i18n.t('metric.' + metric),
          target: localePath(`/leaderboard/${metric}`),
        }))
      }, {
        id: 'guides',
        name: i18n.t('nav.Guides'),
        target: localePath('/blog/guides'),
        children: (toc.value ?? { default: [] }).default.map(post => ({
          id: post.slug,
          name: post.title,
          target: localePath(`/blog/guides/${post.slug}`),
        })),
      }, {
        id: 'starpowers',
        name: i18n.t('nav.Star Powers'),
        target: localePath('/tier-list/starpowers'),
      }, {
        id: 'gadgets',
        name: i18n.t('nav.Gadgets'),
        target: localePath('/tier-list/gadgets'),
      }, {
        id: 'gears',
        name: i18n.t('nav.Gears'),
        target: localePath('/tier-list/gears'),
      }, {
        id: 'dashboard',
        name: i18n.t('nav.Dashboard'),
        target: localePath('/dashboard'),
      }, {
        id: 'teambuilder',
        name: i18n.t('nav.Team Builder'),
        target: localePath('/team-builder'),
      }, {
        id: 'quiz',
        name: i18n.t('nav.Quiz'),
        target: localePath('/quiz'),
      }, {
        id: 'brawlerrecords',
        name: i18n.t('nav.Brawler Records'),
        target: localePath('/brawler-records'),
      }, {
        id: 'barchartrace',
        name: i18n.t('nav.Bar Chart Race'),
        target: localePath('/bar-chart-race'),
      }, {
        id: 'about',
        name: i18n.t('nav.About'),
        target: localePath('/about'),
      }, {
        id: 'status',
        name: i18n.t('nav.Status'),
        target: localePath('/status'),
      }]
    })

    const linkGenerator = (input: string): Link[] => {
      const tagCandidate = input.toUpperCase().replace('#', '')
      if (tagPattern.test(tagCandidate)) {
        return [{
          id: `profile-${tagCandidate}`,
          name: `${i18n.t('nav.Profile')} #${tagCandidate}`,
          target: localePath(`/profile/${tagCandidate}`),
          children: [{
            id: `profile-${tagCandidate}-time`,
            name: i18n.t('player.time-statistics'),
            target: localePath(`/profile/${tagCandidate}#time`),
          }, {
            id: `profile-${tagCandidate}-trophy`,
            name: i18n.t('player.trophy-statistics'),
            target: localePath(`/profile/${tagCandidate}#trophy`),
          }, {
            id: `profile-${tagCandidate}-records`,
            name: i18n.t('player.records.title'),
            target: localePath(`/profile/${tagCandidate}#records`),
          }, {
            id: `profile-${tagCandidate}-battles`,
            name: i18n.t('battle-log'),
            target: localePath(`/profile/${tagCandidate}#battles`),
          }, {
            id: `profile-${tagCandidate}-modes`,
            name: i18n.t('mode', 2),
            target: localePath(`/profile/${tagCandidate}#modes`),
          }, {
            id: `profile-${tagCandidate}-brawlers`,
            name: i18n.t('brawler', 2),
            target: localePath(`/profile/${tagCandidate}#brawlers`),
          }]
        }, {
          id: `club-${tagCandidate}`,
          name: `${i18n.t('nav.Club')} #${tagCandidate}`,
          target: localePath(`/club/${tagCandidate}`),
        }]
      }

      return []
    }

    const popupOpen = ref(false)

    const route = useRoute()
    const search = ref<InstanceType<typeof BSearch>>()
    watch(route, () => {
      popupOpen.value = false
      search.value?.reset()
    })

    const popup = ref<typeof BCard>()


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
      popup,
      linkTree,
      linkGenerator,
      faTimes,
      goToFirstResult,
      popupOpen,
      search,
    }
  },
})
</script>
