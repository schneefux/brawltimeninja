<template>
  <div
    class="link-card flex flex-col justify-end"
    itemscope
    itemtype="http://schema.org/Event"
  >
    <nuxt-link
      :to="`/tier-list/map/${event.id}`"
      class="link-light capitalize"
      :target="isInIframe ? '_blank' : ''"
      itemprop="url"
    >
      <media-img
        :path="'/maps/' + event.id"
        size="384"
        clazz="h-48 mt-4 ml-auto mr-auto"
        itemprop="image"
      ></media-img>
      <meta itemprop="eventAttendanceMode" content="https://schema.org/OnlineEventAttendanceMode" />
      <meta itemprop="eventStatus" content="https://schema.org/EventScheduled" />
      <div itemprop="location" itemscope itemtype="http://schema.org/VirtualLocation">
        <meta itemprop="url" :content="`/tier-list/map/${event.id}`" />
      </div>
      <p class="mt-4 text-center text-xl" itemprop="name">
        {{ formatMode(event.mode) }}
        -
        {{ event.map }}
      </p>
      <meta itemprop="description" :content="`${event.map} is a Brawl Stars ${formatMode(event.mode)} map.`" />
      <meta itemprop="startDate" :content="event.start" />
      <meta itemprop="endDate" :content="event.end" />

      <div v-if="load" class="flex flex-wrap justify-center -mx-2">
        <p class="mb-1 mt-1 w-full text-center text-sm">Best Brawlers:</p>
        <ul>
          <li
            v-for="brawler in (bestByEvent[event.id] || []).slice(0, 3)"
            :key="brawler.id"
            class="inline-block px-2 text-grey-darker text-xs"
            itemprop="performer"
            itemscope
            itemtype="http://schema.org/Person"
          >
            <div class="card border-grey-darker border flex justify-between mx-auto">
              <div class="w-12">
                <media-img
                  :path="'/brawlers/' + brawler.id + '/avatar'"
                  :alt="brawler.name"
                  size="64"
                  clazz="h-8"
                  itemprop="image"
                ></media-img>
              </div>
            </div>
            <p itemprop="name" class="mt-1 text-center">{{ brawler.name }}</p>
            <p
              v-if="brawler.stats"
              class="text-center tracking-tight"
              itemscope
              itemtype="http://schema.org/QuantitativeValue"
            >

              <span itemprop="value">{{ metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }}</span>
              <span itemprop="unitText">{{ metaStatMaps.labelsShort[brawler.sortProp] }}</span>
            </p>
          </li>
        </ul>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatMode, metaStatMaps } from '~/lib/util'
import MediaImg from '~/components/media-img'

export default {
  name: 'EventCard',
  components: {
    MediaImg,
  },
  props: {
    event: {
      type: Object,
      required: true
    },
    load: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    isInIframe() {
      try {
        return global.window === undefined || global.window.self !== global.window.top
      } catch (e) {
        return true
      }
    },
    ...mapState({
      bestByEvent: state => state.bestByEvent,
    })
  },
  data() {
    return {
      formatMode,
      metaStatMaps,
    }
  },
}
</script>
