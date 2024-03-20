<template>
  <b-card
    :title="$t('tier-list.map.report.title', { title })"
    class="max-w-2xl mx-auto"
  >
    <template v-if="timestamp" v-slot:preview>
      <absolute-time
        :timestamp="timestamp"
        format-str="PP"
        class="ml-auto"
      ></absolute-time>
    </template>
    <template v-slot:content>
      <div id="ai-report" class="prose dark:prose-invert flex flex-col items-center">
        <article
          v-html="contentWithoutTitle"
          :class="['-mt-4', {
            'h-24 overflow-hidden fade-out': !expanded,
          }]"
          @click="expanded = true"
        ></article>
        <b-button v-if="!expanded" @click="expanded = true" primary md>
          {{ $t('action.read') }}
        </b-button>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { BCard } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    timestamp: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  emits: {
    interact: null,
  },
  setup(props, { emit }) {
    const contentWithoutTitle = computed(() => {
      // remove first h1 from html
      return props.content.replace(/<h1[^>]*>.*?<\/h1>/, '')
    })

    const expanded = ref(false)

    const handleClick = () => {
      emit('interact')
      expanded.value = !expanded.value
    }

    return {
      expanded,
      handleClick,
      contentWithoutTitle,
    }
  },
})
</script>

<style lang="postcss" scoped>
.fade-out {
  mask-image: linear-gradient(180deg, #000 60%, transparent);
  -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent);
}
</style>
