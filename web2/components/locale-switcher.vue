<template>
  <b-select
    :value="$i18n.locale"
    class="!py-1 -my-1 !text-xs md:text-sm focus:!bg-white"
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
import { useContext, useRouter } from '@/composables/compat'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const { i18n, switchLocalePath } = useContext()
    const router = useRouter()

    const emoji = {
      'en': '🇬🇧',
      'de': '🇩🇪',
      'es': '🇪🇸',
      'ua': '🇺🇦',
      'it': '🇮🇹',
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
