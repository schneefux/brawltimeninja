<template>
  <b-card :title="$t('tier-list.map.report.title', { title })"  class="max-w-2xl">
    <template v-if="timestamp" v-slot:preview>
      <absolute-time
        :timestamp="timestamp"
        format-str="PP"
        class="ml-auto"
      ></absolute-time>
    </template>
    <template v-slot:content>
      <div id="ai-report" class="mx-auto prose dark:prose-invert">
        <details class="outline-hidden">
          <summary
            class="cursor-pointer flex flex-col items-center"
            @click="handleClick()"
          >
            <p>
              {{ $t('tier-list.map.report.summary', { title }) }}
            </p>
            <b-button
              v-if="!expanded"
              class="pointer-events-none"
              primary
              md
            >
              {{ $t('action.read') }}
            </b-button>
          </summary>
          <article v-html="contentWithoutTitle"></article>
        </details>
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
  async setup(props, { emit }) {
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
