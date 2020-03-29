<template>
  <div class="card stats-card">
    <span class="stats-card-title">
      {{ title.toLowerCase() }}
    </span>
    <img
      :src="mediaUrl + '/brawlers/' + brawler + '/avatar?size=160'"
      class="stats-card-image"
    >
    <div class="stats-card-content">
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
  data() {
    return {
      mediaUrl: process.env.mediaUrl,
    }
  },
}
</script>
