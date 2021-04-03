<template>
  <b-select
    :value="$i18n.locale"
    sm
    @input="v => changeLanguage(v)"
  >
    <option
      v-for="l in locales"
      :key="l.code"
      :value="l.code"
    >
      {{ l.emoji }}
    </option>
  </b-select>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  computed: {
    locales() {
      const emoji = {
        'en': '🇬🇧',
        'de': '🇩🇪',
      }
      return this.$i18n.locales?.map((l: any) => ({
        code: l.code,
        emoji: emoji[l.code],
      })) || []
    },
  },
  methods: {
    changeLanguage(code) {
      this.$router.push(this.switchLocalePath(code))
    }
  }
})
</script>
