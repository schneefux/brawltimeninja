<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="id"
  >
    <p v-if="end != undefined" slot="infobar" class="text-right">
      {{ $t('time.ends-in', { time: timeTillEnd }) }}
    </p>

    <div
      slot="content"
      class="h-full flex flex-col justify-center"
    >
      <brawler-kv-card
        :brawler-name="brawlerName"
        :slices="slices"
      ></brawler-kv-card>
    </div>
  </event-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useDateFnLocale } from '~/composables/date-fns'

export default defineComponent({
  props: {
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true
    },
    id: {
      type: [String, Number],
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    end: {
      type: String,
    },
  },
  setup(props) {
    const { locale } = useDateFnLocale()
    const timeTillEnd = computed(() => {
      if (props.end == undefined) {
        return ''
      }
      return formatDistanceToNow(parseISO(props.end), {
        locale: locale.value,
      })
    })

    const slices = computed(() => ({
      map: [props.map],
      mode: [props.mode],
    }))

    return {
      timeTillEnd,
      slices,
    }
  },
})
</script>
