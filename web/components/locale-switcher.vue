<template>
  <div>
    <nuxt-link
      v-for="locale in availableLocales"
      :key="locale.code"
      :to="switchLocalePath(locale.code)"
    >{{ locale.code }}</nuxt-link>
  </div>
</template>


<script lang="ts">
import { mapActions } from 'vuex'
import Vue from 'vue'

export default Vue.extend({
  computed: {
    availableLocales() {
      return this.$i18n.locales!.filter(i => (<any>i).code !== this.$i18n.locale)
    },
  },
  methods: {
    ...mapActions({
      loadTranslations: 'loadTranslations',
    }),
  },
  watch: {
    async '$i18n.locale'() {
      console.log('locale changed')
      await this.loadTranslations(this.$i18n.locale)
    },
  },
})
</script>
