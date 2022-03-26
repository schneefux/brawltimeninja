<template>
  <event-card
    v-bind="$attrs"
    :mode="mode"
    :map="map"
    :link="localePath(linkTarget)"
    nobackground
  >
    <div
      slot="content"
      class="flex flex-wrap justify-evenly items-center"
    >
      <map-img
        v-if="id != undefined"
        :id="id"
        :map="map"
        clazz="h-64"
        class="mt-4"
      ></map-img>

      <div class="mt-4 flex flex-col gap-y-4">
        <b-card
          v-if="timestamp != undefined"
          :elevation="2"
        >
          <dl
            slot="content"
            class="flex justify-between"
          >
            <dt class="text-left mr-1">
              {{ $t('tier-list.map.last-online', { time: '' }) }}
            </dt>
            <dd class="text-right ml-1">
              {{ lastOnlineString }}
            </dd>
          </dl>
        </b-card>

        <b-card
          title="Best Brawlers"
          :elevation="2"
        >
          <map-best-brawlers
            slot="content"
            :slices="{ mode: [mode], map: [map], season: [season] }"
            :elevation="3"
          ></map-best-brawlers>
        </b-card>
      </div>
    </div>
  </event-card>
</template>

<script lang="ts">
import { differenceInMinutes, formatDistanceToNow, parseISO } from 'date-fns'
import { camelToKebab, slugify } from '~/lib/util'
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'

import { enUS, de } from 'date-fns/locale'
const locales = { en: enUS, de: de }

export default defineComponent({
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      type: [String, Number],
    },
    timestamp: {
      type: String,
    },
    season: {
      type: String,
    },
    link: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const { i18n } = useContext()

    const lastOnlineString = computed(() => {
      if (props.timestamp == undefined) {
        return ''
      }
      const date = parseISO(props.timestamp)
      if (differenceInMinutes(new Date(), date) < 60) {
        return i18n.tc('state.event-active')
      }
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: locales[i18n.locale],
      })
    })

    const linkTarget = computed(() => {
      if (props.mode == undefined) {
        return '/tier-list/brawler'
      }

      if (props.map == undefined) {
        return `/tier-list/mode/${camelToKebab(props.mode)}`
      }

      return `/tier-list/mode/${camelToKebab(props.mode)}/map/${slugify(props.map)}`
    })

    return {
      lastOnlineString,
      linkTarget,
    }
  },
})
</script>
