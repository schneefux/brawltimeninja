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

    <lazy-hydrate
      v-if="lazy"
      when-visible
    >
      <div
        :class="{
          'mt-4': title != undefined,
          'mt-8': title == undefined,
        }"
      >
        <slot></slot>
      </div>
    </lazy-hydrate>
    <div
      v-else
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
import LazyHydrate from 'vue-lazy-hydration'

export default defineComponent({
  components: {
    LazyHydrate,
  },
  props: {
    title: {
      type: String,
      required: false
    },
    lazy: {
      type: Boolean,
      default: false
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
