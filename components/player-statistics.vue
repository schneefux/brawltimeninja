<template>
  <div class="leading-tight md:mx-4 flex flex-wrap py-4 px-6">
    <p
        v-for="(stat, statName) in stats"
        :key="statName"
        class="md:text-center text-xl font-semibold my-1 w-full md:w-auto md:mx-auto">
        <span class="md:block md:text-2xl">{{ stat.label }}</span>
        <span class="md:block float-right md:float-none text-primary-lighter md:mt-1">{{ stat.value }}</span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'PlayerStatistics',
  props: {
    stats: {
      type: Object,
      required: true
    },
  },
}
</script>
