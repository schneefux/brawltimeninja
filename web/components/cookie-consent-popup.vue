<template>
  <div
    class="fixed z-30 inset-0 w-full h-full flex justify-center items-center"
    style="background-color: rgba(0, 0, 0, 0.75)"
  >
    <div class="mx-2 py-2 max-w-xl border-4 rounded border-secondary-dark bg-secondary-darker flex flex-col justify-center items-center">
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
        Read the privacy policy or update your preferences later <nuxt-link class="link" to="/about">here</nuxt-link>.
        <summary>More information</summary>
      </details>
      <p class="mt-2 mx-2 text-center">
        Enable Cookies for Settings, Analytics and Ads?
      </p>
      <div class="mt-3 text-sm flex flex-wrap">
        <button
          v-show="showCookieOptions"
          class="border rounded-sm py-1 w-24 mx-1 bg-red-600 hover:bg-red-500"
          @click="$emit('enable-none')"
        >
          Disable All
        </button>
        <button
          v-show="showCookieOptions"
          class="border rounded-sm py-1 w-24 mx-1 bg-yellow-600 hover:bg-yellow-500"
          @click="$emit('enable-cookies')"
        >
          Only Settings
        </button>
        <button
          v-show="!showCookieOptions"
          class="border rounded-sm py-1 w-24 mx-1 bg-secondary-darkest hover:bg-black"
          @click="showCookieOptions = true"
        >
          More Options
        </button>
        <button
          class="border rounded-sm py-1 w-24 mx-1 bg-green-600 hover:bg-green-500"
          @click="$emit('enable-all')"
        >
          Enable All
        </button>
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
