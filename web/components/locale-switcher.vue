<template>
  <b-select
    v-model="locale"
    class="!py-1 -my-1 !text-xs md:text-sm focus:!bg-white"
    sm
  >
    <option
      v-for="l in locales"
      :key="l.iso"
      :value="l.iso"
    >
      {{ l.emoji }}
    </option>
  </b-select>
</template>

<script lang="ts">
import { useSwitchToLocale } from '@/composables/compat'
import { LocaleIso } from '@/locales'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup() {
    const { locales, switchToLocale } = useSwitchToLocale()
    const i18n = useI18n()
    const locale = computed({
      get() {
        return i18n.locale.value as LocaleIso
      },
      set(iso: LocaleIso) {
        const locale = locales.find(l => l.iso == iso)!
        switchToLocale(locale, true)
      }
    })

    return {
      locale,
      locales,
      switchToLocale,
    }
  },
})
</script>
