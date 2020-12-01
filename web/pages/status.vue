<template>
  <div class="container mx-auto py-4 px-4">
    <h1 class="text-4xl font-semibold mt-2">Are Brawl Stars' servers down?</h1>

    <div class="px-2 mt-8 mx-auto max-w-lg">
      <p v-show="status == undefined">Checking…</p>
      <div v-show="status == 'down'">
        <media-img path="/brawlers/spike_loss/model" clazz="mt-8 w-40 mx-auto" alt="Spike"></media-img>
        <h2 class="text-3xl font-bold text-center tracking-wide text-secondary">Oh no!</h2>
        <p class="mt-6">No connection to Brawl Stars servers possible. It's not just you!</p>
      </div>
      <div v-show="status == 'up'">
        <h2 class="text-3xl font-bold text-center tracking-wide text-secondary">All fine!</h2>
        <media-img path="/brawlers/poco/model" clazz="mt-8 w-40 mx-auto" alt="Poco"></media-img>
        <p class="mt-6">If you are having connection issues, try moving closer to your WiFi access point.</p>
      </div>

      <p v-show="status != undefined" class="mt-4">
        Check the official Brawl Stars Twitter feed to find out whether there is a maintenance ongoing:
      </p>

      <div class="mt-8">
        <Timeline id="BrawlStars" sourceType="profile" :options="{ theme: 'dark', height: 600, dnt: true }" />
      </div>
    </div>
  </div>
</template>

<script>
import { Timeline } from 'vue-tweet-embed'

export default {
  head() {
    const description = 'Is Brawl Stars down? Check Brawl Stars server status.'
    return {
      title: 'Are Brawl Stars servers down?',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  components: {
    Timeline,
  },
  data() {
    return {
      status: undefined,
    }
  },
  async created() {
    try {
      await this.$axios.$get('/api/events')
      this.status = 'up'
    } catch {
      this.status = 'down'
    }
  }
}
</script>
