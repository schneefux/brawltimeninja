<template>
  <card
    title="BrawlClopedia scrim"
    class="relative"
    secondary
    sm
  >
    <div slot="content">
      <span class="absolute top-0 right-0 mr-3 mt-2 text-xs">
        advertisement
      </span>
      <a
        href="https://www.reddit.com/r/BrawlClopedia/comments/lgsmnt/brawlclopedia_is_hosting_scrims/"
        rel="sponsored"
        target="_blank"
        class="flex items-center"
      >
        <p class="leading-tight">
          The BrawlClopedia community is hosting a small tournament
        </p>

        <b-button
          slot="actions"
          class="ml-4 w-40"
          md
          primary
        >
          <font-awesome-icon
            :icon="faDoorOpen"
            class="mr-1"
          ></font-awesome-icon>
          Join
        </b-button>
      </a>
    </div>
  </card>
</template>

<script lang="ts">
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons'
import Vue from 'vue'

export default Vue.extend({
  computed: {
    faDoorOpen() {
      return faDoorOpen
    },
  },
})
</script>
