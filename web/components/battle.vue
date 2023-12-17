<template>
  <event-card
    :mode="battle.event.mode"
    :map="battle.event.map"
    :event-id="battle.event.id"
  >
    <template v-slot:infobar>
      <div class="flex justify-between">
        <div>
          <span class="mr-2">{{ battle.result }}</span>
          <span
            v-if="battle.trophyChange != undefined"
            class="font-semibold"
          >
            {{ battle.trophyChange > 0 ? '+' : ''}}{{ battle.trophyChange }}
            <img
              :src="isPowerplay ? powerPlayIcon : trophyIcon"
              class="w-4 inline"
            />
          </span>
        </div>
        <span><client-only>{{ relativeTime }}</client-only></span>
      </div>
    </template>

    <template v-slot:content>
      <div class="flex flex-wrap justify-center -mx-4 h-full items-center">
        <div
          v-for="(team, index) in battle.teams"
          :key="index"
          :class="{
            'mt-8': battle.teams.length == 3,
            'mx-1 rounded-sm flex-col': team.length == 2,
          }"
          class="flex flex-wrap justify-center z-10 my-1"
        >
          <router-link
            v-for="mate in team"
            :key="mate.tag"
            :rel="mate.brawlerTrophies == undefined || mate.brawlerTrophies < 400 ? 'nofollow' : ''"
            :to="localePath(`/profile/${mate.tag}`)"
            :class="{
              'border-2 border-gray-300 ': highlightTags.includes(mate.tag),
              'mx-1 rounded-sm ': team.length != 2,
            }"
            class="w-14 h-16 bg-background/75 p-px relative overflow-hidden text-xs flex flex-col gap-y-px"
            @click.stop
          >
            <span
              v-if="mate.brawlerTrophies != undefined"
              class="h-4 flex"
            >
              <img
                class="mr-1 h-4 py-px object-contain"
                :src="isPowerplay ? powerPlayIcon : trophyIcon"
              >
              {{ mate.brawlerTrophies }}
              {{ mate.isBigbrawler ? '💀' : '' }}
            </span>
            <media-img
              :path="`/brawlers/${mate.brawler}/avatar`"
              :alt="mate.brawler"
              size="160"
              clazz="h-7 -ml-px object-contain"
            ></media-img>
            <span
              class="h-4 whitespace-nowrap overflow-hidden text-ellipsis"
              :class="{
                'text-primary-400': !highlightTags.includes(mate.tag),
              }">{{ mate.name }}</span>
            </router-link>
        </div>
      </div>
    </template>
  </event-card>
</template>

<script lang="ts">
import { Battle } from '~/model/Api'
import { computed, defineComponent, PropType } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useDateFnLocale } from '~/composables/date-fns'
import powerPlayIcon from '~/assets/images/icon/power_play_optimized.png'
import trophyIcon from '~/assets/images/icon/trophy_optimized.png'

export default defineComponent({
  props: {
    battle: {
      type: Object as PropType<Battle>,
      required: true,
    },
    /* without hash */
    highlightTags: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  setup(props) {
    const isPowerplay = computed(() => {
      // TODO receive this from backend
      return props.battle.victory != undefined && props.battle.trophyChange != undefined
        && (props.battle.victory && props.battle.trophyChange > 11 || !props.battle.victory && props.battle.trophyChange > 3)
    })

    const { locale } = useDateFnLocale()
    const relativeTime = computed(() => formatDistanceToNow(props.battle.timestamp, {
      addSuffix: true,
      locale: locale.value,
    }))

    return {
      isPowerplay,
      relativeTime,
      powerPlayIcon,
      trophyIcon,
    }
  },
})
</script>
