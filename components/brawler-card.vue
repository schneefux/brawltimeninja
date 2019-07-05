<template>
  <div
    class="card w-80 h-32 bg-primary-dark flex justify-between mx-auto"
  >
    <div class="w-32 relative">
      <span class="z-10 absolute ml-3 mt-2 font-semibold text-white text-2xl text-shadow whitespace-no-wrap">
        {{ name }}
      </span>
      <img
        :src="require(`~/assets/images/hero/icon/${id}_optimized.png`)"
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
    name: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
  },
  errorCaptured(error) {
    console.log(error)
  },
}
</script>
