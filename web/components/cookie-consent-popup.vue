<template>
  <div
    class="fixed z-30 inset-0 w-full h-full flex justify-center items-center"
    style="background-color: rgba(0, 0, 0, 0.75)"
  >
    <div class="mx-2 py-2 max-w-xl rounded bg-gray-100 text-gray-800 flex flex-col justify-center items-center">
      <p class="text-center text-xl">
        Cookies? 🍪
      </p>
      <p class="mt-2 mx-2 text-center text-sm">
        Brawl Time stores your settings in a Cookie.
        Analytics and Advertisements may set Cookies as well.
      </p>
      <details class="mx-2 text-sm">
        Data that may be collected:
        <ul class="ml-2 list-disc list-inside">
          <li>Your Brawl Stars tag</li>
          <li>Device and Browser you use</li>
          <li>Your IP address</li>
          <li>Pages you open, Buttons you click</li>
          <li>Content visibility</li>
          <li>Errors and performance metrics</li>
        </ul>
        <br>
        How the data is used:
        <ul class="ml-2 list-disc list-inside">
          <li>To generate reports about game statistics</li>
          <li>Customization of advertisements</li>
          <li>To improve the reliability of this service</li>
        </ul>
        <br>
        To collect this information, some data will be shared with Cloudflare, Google Analytics, Google AdSense and Sentry.
        Your information will never be sold.
        <br>
        Read the privacy policy or update your preferences later <nuxt-link class="underline" to="/about">here</nuxt-link>.
        <summary>More information</summary>
      </details>
      <p class="mt-2 mx-2 text-center">
        Enable Cookies for Settings, Analytics and Ads?
      </p>
      <div class="mt-3 text-sm flex flex-wrap justify-center">
        <b-button
          v-if="showCookieOptions"
          class="w-32 mx-2 mb-2 bg-red-400 hover:bg-red-300 border-red-400 text-gray-800"
          lg
          @click="$emit('enable-none')"
        >
          Disable All
        </b-button>
        <b-button
          v-if="showCookieOptions"
          class="w-32 mx-2 mb-2 bg-yellow-400 hover:bg-yellow-300 border-yellow-400 text-gray-800"
          lg
          @click="$emit('enable-cookies')"
        >
          Only Settings
        </b-button>
        <b-button
          v-if="!showCookieOptions"
          class="w-32 mx-2 mb-2 bg-gray-900 hover:bg-gray-800 border-gray-900 text-gray-200"
          lg
          @click="showCookieOptions = true"
        >
          More Options
        </b-button>
        <b-button
          class="w-32 mx-2 mb-2 bg-green-400 hover:bg-green-300 border-green-400 text-gray-800"
          lg
          @click="$emit('enable-all')"
        >
          Enable All
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      showCookieOptions: false,
    }
  },
})
</script>
