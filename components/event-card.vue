<template>
  <div
    class="link-card mx-6 flex flex-col justify-end"
  >
    <nuxt-link
      :to="`/meta/map/${event.id}`"
      class="link-light capitalize"
    >
      <img
        :src="asset.default"
        class="w-full max-w-xs mx-auto"
      >
      <p class="mt-4 text-center text-xl">
        {{ event.mode }}
        -
        {{ event.map }}
      </p>
    </nuxt-link>
  </div>
</template>

<script>
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
      asset: '',
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
