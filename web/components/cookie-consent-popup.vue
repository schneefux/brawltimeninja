<template>
  <div
    class="fixed z-30 inset-0 w-full h-full flex justify-center items-center"
    style="background-color: rgba(0, 0, 0, 0.75)"
  >
    <section class="mx-2 py-2 max-w-xl rounded bg-gray-100 text-gray-800 flex flex-col justify-center items-center">
      <h1 class="text-center text-xl">
        {{ $t('cookie-consent.title') }} 🍪
      </h1>
      <p class="mt-4 mx-2 text-center text-sm">
        {{ $t('cookie-consent.summary') }}
      </p>
      <details class="mx-2 text-sm">
        {{ $t('cookie-consent.list-title') }}
        <ul class="ml-2 list-disc list-inside">
          <li>{{ $t('cookie-consent.tag') }}</li>
          <li>{{ $t('cookie-consent.browser') }}</li>
          <li>{{ $t('cookie-consent.ip') }}</li>
          <li>{{ $t('cookie-consent.pages') }}</li>
          <li>{{ $t('cookie-consent.visibility') }}</li>
          <li>{{ $t('cookie-consent.performance') }}</li>
        </ul>
        <br>
        {{ $t('cookie-consent.usage-title') }}
        <ul class="ml-2 list-disc list-inside">
          <li>{{ $t('cookie-consent.reports') }}</li>
          <li>{{ $t('cookie-consent.ads') }}</li>
          <li>{{ $t('cookie-consent.reliability') }}</li>
        </ul>
        <br>
        {{ $t('cookie-consent.transfer') }}
        <br>
        {{ $t('cookie-consent.link') }}
         <nuxt-link class="underline" to="/about">link</nuxt-link>.
        <summary>{{ $t('cookie-consent.more') }}</summary>
      </details>
      <p class="mt-4 mx-2 text-center">
        {{ $t('cookie-consent.question') }}
      </p>
      <div class="mt-6 text-sm flex flex-wrap justify-center gap-2">
        <b-button
          v-if="showCookieOptions"
          class="w-32 bg-red-400 border-red-400 hover:border-red-300 text-gray-800"
          md
          @click="$emit('enable-none')"
        >
          {{ $t('cookie-consent.none') }}
        </b-button>
        <b-button
          v-if="showCookieOptions"
          class="w-32 bg-yellow-400 border-yellow-400 hover:border-yellow-300 text-gray-800"
          md
          @click="$emit('enable-cookies')"
        >
          {{ $t('cookie-consent.settings') }}
        </b-button>
        <b-button
          v-if="!showCookieOptions"
          class="w-32 bg-gray-800 border-gray-800 hover:border-gray-700 text-gray-200"
          md
          @click="showCookieOptions = true"
        >
          {{ $t('cookie-consent.expand') }}
        </b-button>
        <b-button
          class="w-32 bg-green-400 border-green-400 hover:border-green-300 text-gray-800"
          md
          @click="$emit('enable-all')"
        >
          {{ $t('cookie-consent.all') }}
        </b-button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const showCookieOptions = ref(false)

    return {
      showCookieOptions,
    }
  },
})
</script>
