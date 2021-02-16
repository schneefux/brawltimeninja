<template>
  <div class="flex flex-wrap justify-center">
    <card
      v-for="post in posts"
      :key="post.id"
      :title="post.title"
      :title-link="`/blog/${topic}/${post.slug}`"
      :icon="'mode' in post ? `/modes/${post.mode}/icon` : undefined"
      full-height
      light
      sm
    >
      <p slot="content">
        {{ post.description }}
      </p>

      <b-button
        slot="actions"
        :to="`/blog/${topic}/${post.slug}`"
        primary
        prefetch
        sm
      >{{ $t('action.read') }}</b-button>
    </card>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    topic: {
      type: String,
      required: true
    },
    posts: {
      type: Array as PropType<any>,
      required: true
    },
  },
})
</script>
