<template>
  <div class="flex flex-col items-center">
    <div class="text-center font-sans mb-4">
      <h1>How much time on &#8230;</h1>
    </div>
    <router-link
      v-for="service in services"
      :key="service.id"
      :to="`/${service.id}`"
      tag="button"
      class="text-secondary hover:text-secondary-lightest font-semibold leading-normal">
      {{ service.label }}
    </router-link>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const services = await $axios.$get('/api/services')
    return {
      services,
    }
  },
}
</script>
