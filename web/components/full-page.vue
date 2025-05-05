<template>
  <ad kind="top"></ad>

  <b-page
    :title="title"
    class="bg-background text-text vm-main-content lg:mx-auto lg:rounded-2xl lg:px-6 lg:py-4"
  >
    <b-title
      v-if="title"
      :title="title"
      class="mb-4 md:hidden"
    ></b-title>

    <div>
      <slot></slot>
    </div>
  </b-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BPage } from '@schneefux/klicker/components'

/**
 * single column page layout
 */
export default defineComponent({
  components: {
    BPage,
  },
  props: {
    title: {
      type: String,
      required: false
    },
  },
})
</script>
