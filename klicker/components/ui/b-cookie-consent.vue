t<template>
  <div
    class="fixed z-30 inset-0 w-full h-full flex justify-center items-center"
    style="background-color: rgba(0, 0, 0, 0.75)"
  >
    <section class="mx-2 py-2 max-w-xl rounded bg-background text-text flex flex-col justify-center items-center">
      <h1 class="text-center text-xl">
        {{ translate('cookie-consent.title') }} 🍪
      </h1>
      <p class="mt-4 mx-2 text-center text-sm">
        {{ translate('cookie-consent.summary') }}
      </p>
      <details class="mx-2 text-sm">
        {{ translate('cookie-consent.list-title') }}
        <ul class="ml-2 list-disc list-inside">
          <li>{{ translate('cookie-consent.tag') }}</li>
          <li>{{ translate('cookie-consent.browser') }}</li>
          <li>{{ translate('cookie-consent.ip') }}</li>
          <li>{{ translate('cookie-consent.pages') }}</li>
          <li>{{ translate('cookie-consent.visibility') }}</li>
          <li>{{ translate('cookie-consent.performance') }}</li>
        </ul>
        <br>
        {{ translate('cookie-consent.usage-title') }}
        <ul class="ml-2 list-disc list-inside">
          <li>{{ translate('cookie-consent.reports') }}</li>
          <li>{{ translate('cookie-consent.ads') }}</li>
          <li>{{ translate('cookie-consent.reliability') }}</li>
        </ul>
        <br>
        {{ translate('cookie-consent.transfer') }}
        <br>
        {{ translate('cookie-consent.link') }}
        <slot name="link"></slot>
        <summary>{{ translate('cookie-consent.more') }}</summary>
      </details>
      <p class="mt-4 mx-2 text-center">
        {{ translate('cookie-consent.question') }}
      </p>
      <div class="mt-6 text-sm flex flex-wrap justify-center gap-2">
        <b-button
          v-if="showCookieOptions"
          class="light w-32 bg-red-400 border-red-400 hover:border-red-300 hover:bg-red-300 focus:ring-red-300 text-text"
          md
          @click="$emit('enable-none')"
        >
          {{ translate('cookie-consent.none') }}
        </b-button>
        <b-button
          v-if="showCookieOptions"
          class="light w-32 bg-yellow-400 border-yellow-400 hover:border-yellow-300 hover:bg-yellow-300 focus:ring-yellow-300 text-text"
          md
          @click="$emit('enable-cookies')"
        >
          {{ translate('cookie-consent.settings') }}
        </b-button>
        <b-button
          v-if="!showCookieOptions"
          class="w-32 bg-contrast/10 border-contrast/10 hover:bg-border-contrast/25 hover:bg-contrast/25"
          md
          @click="showCookieOptions = true"
        >
          {{ translate('cookie-consent.expand') }}
        </b-button>
        <b-button
          class="light w-32 bg-green-400 border-green-400 hover:border-green-300 hover:bg-green-300 focus:ring-green-300 text-text"
          md
          @click="$emit('enable-all')"
        >
          {{ translate('cookie-consent.all') }}
        </b-button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { useKlickerConfig } from '../../composables/klicker'
import { defineComponent, ref } from 'vue'
import BButton from './b-button.vue'

export default defineComponent({
  components: {
    BButton,
  },
  emits: ['enable-all', 'enable-cookies', 'enable-none'],
  setup() {
    const { translate } = useKlickerConfig()
    const showCookieOptions = ref(false)

    return {
      showCookieOptions,
      translate,
    }
  },
})
</script>
