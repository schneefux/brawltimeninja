<template>
  <div class="py-4 px-2">
    <div class="px-6 my-8 relative text-center max-w-lg mx-auto">
      <h1 class="sticky z-10 top-0 pt-15vh text-4xl md:text-center font-semibold">
        Does
        <span class="text-primary-light capitalize inline-block">
          {{ brawler.name.toLowerCase() }}
        </span>
        need a buff?
      </h1>

      <img
        class="sticky z-0 top-0 ml-auto pt-25vh mt-25vh h-60vh opacity-50"
        :src="mediaUrl + '/brawlers/' + brawler.id + '/model'"
      />

      <p class="sticky z-10 top-0 pt-35vh mt-25vh text-6xl font-semibold text-secondary">
        Yes!
      </p>
      <p class="sticky z-10 top-0 pt-55vh mt-50vh text-2xl font-semibold">
        <span class="capitalize inline-block">
          {{ brawler.name.toLowerCase() }}
        </span>
        has a Win Rate of just
        <span class="text-primary-lighter inline-block">
          {{ Math.round(100 * brawler.stats.winRate).toFixed(2) }}%
        </span>
        which is slightly lower than an average 50%.
      </p>

      <p class="sticky z-10 top-0 pt-70vh mt-10vh text-2xl">
        Having played
        <span class="text-secondary-light inline-block">
          {{ (Math.floor(brawler.sampleSize / 1000) * 1000).toLocaleString() }}
        </span>
        3v3 Battles, players have lost
        <span class="text-secondary-light inline-block">
          {{ (Math.floor(brawler.sampleSize * (1 - brawler.stats.winRate) / 1000) * 1000).toLocaleString() }}
        </span>.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BuffMetaPage',
  data() {
    return {
      mediaUrl: process.env.mediaUrl,
    }
  },
  async asyncData({ store, params }) {
    await store.dispatch('loadBrawlerMeta')
    const brawler = store.state.brawlerMeta.find(b => b.id === params.brawler)
    return {
      brawler,
    }
  },
}
</script>
