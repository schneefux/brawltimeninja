<template>
  <div class="container text-center mx-auto py-4 px-2">
    <img class="h-32 mt-6 inline" src="~/assets/images/hero/model/spike_loss_optimized.png">
    <h1 class="text-3xl">
      Oops!
    </h1>
    <h2 class="text-2xl">
      {{ error.message }}.
    </h2>
    <h3
      v-if="error.statusCode == 429 || error.statusCode >= 500"
      class="text-2xl mt-2"
    >
      Could not communicate with the Brawlstars API! Try again later.
    </h3>
    <p class="mt-4">
      <nuxt-link
        to="/"
        class="link"
      >
        Return to home
      </nuxt-link>
    </p>

    <youtube
      v-if="error.statusCode == 404"
      ref="helpVideo"
      class="mt-6 mx-auto max-w-full"
      width="480"
      height="271"
      video-id="LuUmyorhSIQ"
      autoplay
      mute
      @ready="$ga.event('player', 'play_video', '404')"
      @ended="$refs.helpVideo.player.playVideo()"
    />
  </div>
</template>

<script>
import Youtube from '~/components/youtube'

export default {
  layout: 'default',
  components: {
    Youtube,
  },
  props: ['error'],
}
</script>
