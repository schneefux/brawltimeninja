<template>
  <card
    title="What is your Brawler Personality?"
    :subtitle="`Answer ${Object.keys(oejtsScores).length} questions to find out!`"
    md
  >
    <img slot="preview" class="h-24 my-3" src="~/assets/images/Ranged_Bot.png">
    <b-button
      slot="actions"
      to="/quiz?start"
      class="mx-auto"
      primary
      md
    >Start Quiz</b-button>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { oejtsScores } from '~/lib/oejts'

export default Vue.extend({
  computed: {
    oejtsScores() {
      return oejtsScores
    },
  },
})
</script>
