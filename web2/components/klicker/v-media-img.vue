<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card != undefined && { ...card, title }"
    component="v-media-img"
  >
    <template v-slot:content><media-img
      
      :path="path"
    ></media-img></template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VCardWrapper } from '@schneefux/klicker/components'
import { StaticProps } from '@schneefux/klicker/props'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...StaticProps,
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
