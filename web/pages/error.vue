<template>
  <main class="text-center pt-[20vh] pb-4 px-2">
    <h1 class="mt-8 text-3xl">
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
      <div class="mt-8 flex justify-center">
        <p v-if="error != undefined" class="text-left text-sm">
          <span>Error details:</span>
          <pre class="max-w-xl whitespace-normal">{{ error }}</pre>
        </p>

        <b-button
          class="mt-4"
          md
          dark
          @click="feedbackModalOpen = true"
        >{{ $t('feedback.bug-cta' )}}</b-button>
        <sentry-feedback v-model="feedbackModalOpen"></sentry-feedback>
      </div>
    </client-only>
  </main>
</template>

<script lang="ts">
import { usePageContext } from '~/composables/page-context';
import { defineComponent, computed, ref } from 'vue'
import { BButton } from '@schneefux/klicker/components';

export default defineComponent({
  components: {
    BButton,
  },
  props: {
    routeNotFound: { // set by catch-all route configured below
      type: Boolean,
      required: false
    },
  },
  setup(props) {
    const pageContext = usePageContext()
    if (pageContext.abortStatusCode == undefined && props.routeNotFound) {
      pageContext.abortStatusCode = 404 // set status code returned by server
    }

    const notFound = computed(() => pageContext.abortStatusCode == 404)
    const error = computed(() => pageContext.abortReason)

    const feedbackModalOpen = ref(false)

    return {
      notFound,
      error,
      feedbackModalOpen,
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
