<template>
  <card v-bind="$attrs">
    <template v-slot:content>
      <slot
        name="content"
        :open="page > 0"
        :page="page"
      ></slot>
    </template>

    <div
      slot="actions"
      class="w-full flex justify-center"
      ref="top"
      :key="page"
    >
      <!--
        key forces Vue to render two distinct
        elements for open and close.
        On re-render, the browser will add the new
        button below the slot.
        Without key, the content is added above the
        existing slot,
        effectively pushing the scroll position down.
      -->
      <b-button
        v-if="page > 0"
        class="mx-2"
        primary
        sm
        @click="collapse"
      >
        {{ $t('action.collapse') }}
      </b-button>
      <b-button
        v-if="page < pages"
        class="mx-2"
        primary
        sm
        @click="expand"
      >
        {{ $t('action.expand') }}
      </b-button>
    </div>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    pages: {
      type: Number,
      default: 1
    },
  },
  data() {
    return {
      page: 0,
    }
  },
  methods: {
    expand() {
      this.page++
    },
    collapse() {
      this.page = 0
      // after collapse, scroll the page up
      // so that the more/less buttons are at the same position again
      // (undoing the {key} hack)
      const offset = -(this.$refs['top'] as HTMLElement).getBoundingClientRect().top
      // get the ref again
      // because the element has been rerendered with the {key} hack!
      this.$nextTick(() => this.$scrollTo(this.$refs['top'] as HTMLElement, 0, { offset }))
    },
  },
})
</script>
