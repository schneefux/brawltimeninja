<template>
  <section
    :aria-labelledby="title != undefined ? id : undefined"
  >
    <div
      v-if="title != undefined"
      class="mt-16"
    >
      <h1
        class="text-2xl"
        :id="id"
      >
        {{ title }}
      </h1>
      <slot name="description"></slot>
    </div>

    <div
      :class="{
        'mt-4': title != undefined,
        'mt-8': title == undefined,
      }"
    >
      <slot></slot>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'
import { useUniqueId } from '../../composables/id'

export default defineComponent({
  props: {
    title: {
      type: String
    },
  },
  setup() {
    const { id } = useUniqueId()

    return {
      id,
    }
  },
})
</script>
