<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title }"
    component="v-media-img"
  >
    <media-img
      slot="content"
      :path="path"
    ></media-img>
  </v-card-wrapper>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { OptionalVisualisationProps } from '~/klicker'
import { VCardWrapper } from '~/klicker/components'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...OptionalVisualisationProps,
    title: {
      type: String,
      required: false
    },
    path: {
      type: String,
      required: true
    },
  },
})
</script>
