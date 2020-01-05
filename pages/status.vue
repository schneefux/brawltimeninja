<template>
  <div class="container mx-auto py-4 px-4">
    <h1 class="text-4xl font-semibold mt-2">Are Brawl Stars' servers down?</h1>

    <div class="px-2 mt-8 mx-auto max-w-lg">
      <p v-show="status == undefined">Checking…</p>
      <div v-show="status == 'down'">
        <img src="~/assets/images/hero/model/spike_loss.png" class="mt-8 w-40 mx-auto" alt="Spike" />
        <h2 class="text-3xl font-bold text-center tracking-wide text-secondary">Oh no!</h2>
        <p class="mt-6">No connection to Brawl Stars servers possible. It's not just you!</p>
      </div>
      <div v-show="status == 'up'">
        <h2 class="text-3xl font-bold text-center tracking-wide text-secondary">All fine!</h2>
        <img src="~/assets/images/hero/model/poco.png" class="mt-8 w-40 mx-auto" alt="Poco" />
        <p class="mt-6">If you are having connection issues, try moving closer to your WiFi access point.</p>
      </div>

      <p v-show="status != undefined" class="mt-4">
        Check the official Brawl Stars Twitter feed to find out whether there is a maintenance ongoing:
      </p>

      <div class="mt-8">
        <a
          class="twitter-timeline"
          data-height="600"
          data-dnt="true"
          data-theme="dark"
          href="https://twitter.com/BrawlStars?ref_src=twsrc%5Etfw"
        >Tweets by BrawlStars</a>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </div>
    </div>
  </div>
</template>

<script>
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
  data() {
    return {
      status: undefined
    }
  },
  async created() {
    try {
      await this.$axios.$get('/api/current-events')
      this.status = 'up'
    } catch {
      this.status = 'down'
    }
  }
}
</script>
