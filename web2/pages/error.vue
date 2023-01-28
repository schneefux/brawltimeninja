<template>
  <main class="flex flex-col justify-center items-center container text-center py-4 px-2">
    <h1 class="text-3xl">
      Oops!
    </h1>
    <h2 v-if="notFound" class="text-2xl">
      This page does not exist
    </h2>
    <p class="mt-4">
      <b-button
        tag="a"
        href="/"
        primary
        md
      >
        Go to home
      </b-button>
    </p>
    <client-only>
      <p v-if="error != undefined" class="mt-8 text-left text-sm">
        <span>Error details:</span>
        <pre v-if="error != undefined">{{ error }}</pre>
      </p>
    </client-only>
  </main>
</template>

<script lang="ts">
import { usePageContext } from '@/renderer/usePageContext';
import { defineComponent, computed } from 'vue'
import { BButton } from '@schneefux/klicker/components';

export default defineComponent({
  components: {
    BButton,
  },
  props: {
    routeNotFound: {
      type: Boolean,
      required: false
    },
  },
  setup(props) {
    const pageContext = usePageContext()
    if (props.routeNotFound) {
      pageContext.statusCode = 404
    }

    const notFound = computed(() => pageContext.statusCode == 404)
    const error = computed(() => pageContext.errorWhileRendering)


    return {
      notFound,
      error,
    }
  },
})
</script>

<route lang="json5">
{
  path: '/:pathMatch(.*)*',
  props: {
    routeNotFound: true
  }
}
</route>
