<template>
  <b-select
    :value="$i18n.locale"
    class="!py-1 -my-1 !text-xs md:text-sm"
    primary
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
import { defineComponent, useContext, useRouter } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const { i18n, switchLocalePath } = useContext()
    const router = useRouter()

    const emoji = {
      'en': '🇬🇧',
      'de': '🇩🇪',
      'es': '🇪🇸',
    }
    const locales = i18n.locales?.map((l: any) => ({
      code: l.code,
      emoji: emoji[l.code],
    })) || []
    const changeLanguage = (code) => router.push(switchLocalePath(code))

    return {
      locales,
      changeLanguage,
    }
  },
})
</script>
