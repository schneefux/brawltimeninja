<template>
  <b-card :title="title">
    <div slot="content" class="flex justify-content">
      <media-img
        :path="image"
        slot="content"
        size="512"
        clazz="h-auto"
      ></media-img>
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
    const image = computed(() => props.id == '0' ? `/maps/competition-winners/${props.map.replace('Competition Winner ', '')}` : `/maps/${props.id}`)

    return {
      title,
      image,
    }
  },
})
</script>
