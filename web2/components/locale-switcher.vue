<template>
  <b-select
    v-model="locale"
    class="!py-1 -my-1 !text-xs md:text-sm focus:!bg-white"
    sm
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
import { useSwitchToLocale } from '@/composables/compat'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup() {
    const { locales, switchToLocale } = useSwitchToLocale()
    const i18n = useI18n()
    const locale = computed({
      get() {
        return i18n.locale.value
      },
      set(code: string) {
        switchToLocale(code)
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
