<template>
  <b-card
    :title="$t('player.survey.cta', {
      mode: $t('mode.' + mode),
    })"
    :icon="`/modes/${modeSlug}/icon`"
    class="max-w-md"
  >
    <template v-slot:icon="data">
      <media-img-icon v-bind="data"></media-img-icon>
    </template>

    <template v-slot:content>
      <div v-if="finished">
        <p class="text-center">
          {{ $t('player.survey.thanks') }}
        </p>

        <div class="flex justify-center gap-x-4 mt-3">
          <b-button
            :to="localePath(`/tier-list/mode/${modeSlug}`)"
            light
            md
          >{{ $t('component.tier-list.for.mode', {
            mode: $t('mode.' + mode),
          }) }}</b-button>
        </div>
      </div>
      <div
        v-else
        class="flex justify-center gap-x-4 mb-3"
        @click.once="$emit('interact')"
      >
        <b-button
          v-for="choice in choices"
          :key="choice.slug"
          class="text-center flex-1"
          dark
          md
          @click="vote(choice.brawlstarsId)"
        >
          <media-img
            :path="`/brawlers/${choice.slug}/avatar`"
            :alt="choice.name"
            size="256"
            clazz="w-16 h-16 object-contain mx-auto"
          ></media-img>
          <span class="block mt-1 mb-1">{{ choice.name }}</span>
        </b-button>

        <b-progress
          :value="progress"
          class="absolute bottom-0 inset-x-0 h-2! px-3"
        ></b-progress>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, PropType } from 'vue'
import { BrawlerMetadata, useAllBrawlers } from '~/composables/dimension-values'
import { camelToKebab } from '~/lib/util'
import { usePreferences } from '~/stores/preferences'
import { BCard, BProgress } from '@schneefux/klicker/components'
import { useApi } from '~/composables/compat'
import { Player } from '~/model/Api'

const CHOICES = 3

export default defineComponent({
  components: {
    BCard,
    BProgress,
  },
  props: {
    mode: {
      type: String,
      required: true,
    },
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
  setup(props) {
    const store = usePreferences()
    const brawlers = useAllBrawlers()
    const api = useApi()

    const brawlersNotSeen = computed(() => {
      const brawlersSeenIds = store.state.value.modeSurveyBrawlersSeen[props.mode] ?? []
      return brawlers.value.filter(brawler => !brawlersSeenIds.includes(brawler.brawlstarsId))
    })

    const progress = computed(() => 1 - brawlersNotSeen.value.length / brawlers.value.length)
    const finished = computed(() => brawlersNotSeen.value.length < CHOICES)

    const generateChoices = () => {
      if (finished.value) {
        return
      }

      choices.value = brawlersNotSeen.value
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, CHOICES)
    }

    const choices = ref<BrawlerMetadata[]>([])
    onMounted(() => generateChoices())

    const vote = async (brawlerId: string) => {
      store.addBrawlersSeenInModeSurvey(props.mode, choices.value.map(choice => choice.brawlstarsId))

      await api.survey.vote.mutate({
        tag: props.player.tag.substring(1),
        mode: props.mode,
        best: brawlerId,
        rest: choices.value.filter(choice => choice.brawlstarsId != brawlerId).map(choice => choice.brawlstarsId),
        player: {
          trophies: props.player.trophies,
          brawlersTrophies: Object.values(props.player.brawlers).map(brawler => ({
            name: brawler.name,
            power: brawler.power,
            trophies: brawler.trophies,
          })),
        },
      })

      generateChoices()
    }

    const modeSlug = computed(() => camelToKebab(props.mode))

    return {
      progress,
      finished,
      choices,
      modeSlug,
      vote,
    }
  },
})
</script>
