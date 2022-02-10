<template>
  <b-card :title="title">
    <div slot="content" class="flex justify-content">
      <map-img
        :id="id"
        :map="map"
        slot="content"
        clazz="h-auto"
      ></map-img>
    </div>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    map: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const { i18n } = useContext()
    const title = computed(() => props.id == '0' ? i18n.tc('competition-winner', 1) : i18n.t('map.' + props.id))

    return {
      title,
    }
  },
})
</script>
