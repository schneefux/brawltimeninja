<template>
  <div
    class="link-card mx-6 flex flex-col justify-end"
  >
    <nuxt-link
      :to="`/meta/map/${event.id}`"
      class="link-light capitalize"
    >
      <div
        v-if="asset.default"
        :style="`background-image: url('${asset.default}')`"
        class="h-48 bg-contain bg-no-repeat bg-center mt-6"
      />
      <p class="mt-4 text-center text-xl">
        {{ formatMode(event.mode) }}
        -
        {{ event.map }}
      </p>
    </nuxt-link>
  </div>
</template>

<script>
import { formatMode } from '~/store/index'

export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      asset: {},
      formatMode,
    }
  },
  async mounted() {
    try {
      this.asset = await import(`~/assets/images/bs-assets/map_images/${this.event.id.replace(/^1500/, '150')}.png`)
    } catch (e) {
      this.$ga.exception('cannot load map image: ' + e.message)
      console.log('cannot load map image', e)
    }
  },
}
</script>
