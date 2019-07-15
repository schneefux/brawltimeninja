<template>
  <div
    class="link-card mx-6 flex flex-col justify-end"
  >
    <nuxt-link
      :to="`/meta/map/${event.id}`"
      class="link-light capitalize"
    >
      <img
        :src="require(`~/assets/images/bs-assets/map_images/${event.id.replace(/^1500/, '150')}.png`)"
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
  errorCaptured(error) {
    console.log(error)
  },
}
</script>
