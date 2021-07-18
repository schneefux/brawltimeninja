<template>
  <card
    v-if="result == undefined"
    title="What is your Brawler Personality?"
    :subtitle="`Answer ${Object.keys(oejtsScores).length} questions to find out!`"
    :secondary="highlighted"
    md
  >
    <img slot="preview" class="w-12 md:w-10 my-2" src="~/assets/images/Ranged_Bot.png">
    <b-button
      slot="actions"
      to="/quiz?start"
      class="mx-auto"
      primary
      md
    >Start Quiz</b-button>
  </card>
  <card
    v-else
    title="Brawler Personality Test"
    :subtitle="`Your Result: ${personalityTestResult}`"
    :secondary="highlighted"
    md
  >
    <media-img
      slot="preview"
      :path="`/brawlers/${result}/model`"
      size="256"
      clazz="h-24 md:h-16 my-2"
    ></media-img>
    <b-button
      slot="actions"
      to="/quiz?start"
      class="mx-auto"
      primary
      md
    >{{ $t('action.restart') }}</b-button>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { oejtsScores } from '~/lib/oejts'
import { mapState } from 'vuex'
import { brawlerId } from '~/lib/util'

export default Vue.extend({
  props: {
    highlighted: {
      type: Boolean
    },
  },
  computed: {
    oejtsScores() {
      return oejtsScores
    },
    result() {
      if (this.personalityTestResult == undefined) {
        return undefined
      }
      return brawlerId({ name: this.personalityTestResult })
    },
    ...mapState({
      personalityTestResult: (state: any) => state.personalityTestResult as string|undefined,
    })
  },
})
</script>
