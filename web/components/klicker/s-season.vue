<template>
  <b-select
    v-if="seasonsOptions.length > 0"
    v-model="value"
    dark
    sm
  >
    <option
      v-for="s in seasonsOptions"
      :key="s.value"
      :value="s.value"
    >
      {{ s.formatted }}
    </option>
  </b-select>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { useAllSeasons } from '~/composables/dimension-values'
import { useDateFnLocale } from '~/composables/date-fns';
import { format } from 'date-fns'
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    onInput: {
      type: Function as PropType<SliceValueUpdateListener>,
      required: true
    },
    limitSince: {
      type: Number,
      default: 8
    },
    limitAt: {
      type: Number,
      default: 52
    },
  },
  setup(props) {
    const i18n = useI18n()
    const { locale } = useDateFnLocale()

    const seasons = useAllSeasons(Math.max(props.limitSince, props.limitAt))

    const seasonsOptions = ref<{
      value: string,
      formatted: string
    }[]>([])
    const updateSeasonsOptions = () => {
      seasonsOptions.value = seasons.value.slice(0, props.limitSince).map(s => ({
        value: `since@${s.id}`,
        formatted: i18n.t('option.season-since', {
          season: format(s.start, 'PP', {
            locale: locale.value,
          }),
        }),
      })).concat(seasons.value.slice(0, props.limitAt).map(s => ({
        value: `at@${s.id}`,
        formatted: i18n.t('option.season-at', {
          season: format(s.start, 'PP', {
            locale: locale.value,
          }),
        }),
      })))
    }
    // use refs instead of computed to avoid hydration mismatches
    watch(seasons, updateSeasonsOptions)
    onMounted(updateSeasonsOptions)

    const value = computed({
      get() {
        // 'season' is always set, so check seasonAt for existence first as it takes precedence
        const seasonAt = (props.modelValue.seasonExact || [])[0]
        if (seasonAt != undefined) {
          return `at@${seasonAt}`
        }
        const seasonSince = (props.modelValue.season || [])[0]
        if (seasonSince != undefined) {
          return `since@${seasonSince}`
        }
        throw new Error('No season selected')
      },
      set(v: string) {
        const [operator, value] = v.split('@')
        if (operator == 'at') {
          props.onInput({ season: [value], seasonExact: [value] })
        }
        if (operator == 'since') {
          props.onInput({ season: [value], seasonExact: [] })
        }
      }
    })

    return {
      value,
      seasonsOptions,
    }
  },
})
</script>
