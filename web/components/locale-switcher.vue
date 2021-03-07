<template>
  <div class="inline">
    <nuxt-link
      v-for="locale in availableLocales"
      :key="locale.code"
      :to="switchLocalePath(locale.code)"
    >{{ emojis[locale.code] }}</nuxt-link>
  </div>
</template>


<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  computed: {
    availableLocales() {
      return this.$i18n.locales!.filter(i => (<any>i).code !== this.$i18n.locale)
    },
    emojis() {
      return {
        'en': '🇬🇧',
        'de': '🇩🇪',
      }
    },
  },
})
</script>
