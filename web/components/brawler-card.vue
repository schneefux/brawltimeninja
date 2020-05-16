<template>
  <div class="card stats-card">
    <span class="stats-card-title">
      {{ title.toLowerCase() }}
    </span>
    <media-img
      :path="'/brawlers/' + brawler + '/avatar'"
      :size="160"
      clazz="stats-card-image"
    ></media-img>
    <media-img
      v-if="icon !== ''"
      :path="icon"
      :size="80"
      clazz="stats-card-icon"
    ></media-img>
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
import MediaImg from '~/components/media-img'

export default {
  name: 'BrawlerCard',
  components: {
    MediaImg,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    brawler: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '',
    },
  },
}
</script>
