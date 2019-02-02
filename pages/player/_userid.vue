<template>
  <div class="container mx-auto p-4">
    <div class="font-sans">
      <h1>Statistics for <span class="text-yellow">{{ player.name }}</span></h1>
    </div>

    <div class="md:mx-6 my-4">
      <div v-for="(victories, mode) in player.victoriesByMode" :key="mode" class="my-4 text-black bg-grey-lightest max-w-sm rounded overflow-hidden shadow-lg">
        <div class="mx-6 my-4">
          <div class="font-bold text-xl mb-2">{{ mode }}</div>
          <p class="text-grey-darker text-base">
            {{ victories }} victories
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $axios }) {
    const player = await $axios.$get('/api/brawlstars/player/' + params.userid)
    return {
      player,
      error: ''
    }
  }
}
</script>
