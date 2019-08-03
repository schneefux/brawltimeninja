<template>
  <div class="card w-80 h-32 bg-primary-dark flex justify-between mx-auto">
    <div class="w-32 relative">
      <span class="z-10 absolute left-0 ml-3 mt-2 font-semibold text-white text-2xl text-shadow whitespace-no-wrap capitalize">
        {{ title.toLowerCase() }}
      </span>
      <img
        :src="require(`~/assets/images/hero/icon/${brawler}_optimized.png`)"
        class="z-0 absolute bottom-0 h-20"
      >
    </div>
    <div class="py-2 pr-3 flex flex-col justify-center items-end">
      <div>
        <slot name="history" />
      </div>
      <div>
        <slot name="stats" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BrawlerCard',
  props: {
    title: {
      type: String,
      required: true
    },
    brawler: {
      type: String,
      required: true,
    },
  },
}
</script>
