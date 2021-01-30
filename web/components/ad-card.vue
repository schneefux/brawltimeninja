<template>
  <card
    title="Check out this video!"
    subtitle="Brawl Stars on the piano"
    class="relative"
    secondary
    sm
  >
    <div slot="content">
      <span class="absolute top-0 right-0 mr-3 mt-2 text-xs">
        advertisement
      </span>
      <a
        href="https://www.youtube.com/watch?v=_eN7Mhgya9k"
        rel="sponsored"
        target="_blank"
        class="flex items-center"
      >
        <img
          src="~/assets/piano-promo.jpg"
          class="absolute top-0 right-0 mr-10 mt-8 w-14"
        >
        <p class="leading-tight">
          Subscribe to my brother's YouTube channel for more 🎶
        </p>

        <b-button
          slot="actions"
          class="ml-4 w-40"
          md
          primary
        >
          <font-awesome-icon
            :icon="faYoutube"
            class="mr-1"
          ></font-awesome-icon>
          Watch
        </b-button>
      </a>
    </div>
  </card>
</template>

<script lang="ts">
import { faYoutube } from '@fortawesome/free-brands-svg-icons'
import Vue from 'vue'

export default Vue.extend({
  computed: {
    faYoutube() {
      return faYoutube
    },
  },
})
</script>
