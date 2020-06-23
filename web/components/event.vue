<template>
  <div class="flex w-80 mx-2 md:w-1/2 xl:w-1/3 card-wrapper md:mx-auto">
    <div class="card h-full w-full">
      <div v-if="infobar" class="bg-black text-primary-lightest w-full px-2 py-1 text-lg font-semibold">
        <slot name="infobar" />
      </div>
      <div
        class="w-full px-3 py-2 flex font-semibold justify-start items-center"
        :class="`bg-color-${mode.toLowerCase()}`"
      >
        <media-img :path="'/modes/' + mode + '/icon'"
          size="120"
          clazz="w-10"
        ></media-img>
        <div class="ml-2 text-white">
          <p class="text-xl">
            {{ formatMode(mode) }}
          </p>
          <p v-if="map !== undefined">
            {{ map }}
          </p>
        </div>
      </div>
      <div class="relative z-0">
        <media-img :path="'/modes/' + mode + '/background'"
          size="800"
          clazz="absolute left-0 top-0 h-32"
          ztyle="filter: brightness(0.75) grayscale(0.25);"
        ></media-img>
      </div>
      <div class="relative z-10">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>

<script>
import { formatMode } from '~/lib/util'
import MediaImg from '~/components/media-img'

export default {
  name: 'Event',
  components: {
    MediaImg,
  },
  props: {
    mode: {
      type: String,
      required: true
    },
    map: {
      type: String,
      required: false
    },
    infobar: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      formatMode,
    }
  },
}
</script>

<style scoped>
.bg-color-heist {
  background-color: #c663cd;
}

.bg-color-siege {
  background-color: #ef5132;
}

.bg-color-soloshowdown,
.bg-color-duoshowdown {
  background-color: #81d621;
}

.bg-color-bounty {
  background-color: #10b2b7;
}

.bg-color-brawlball {
  background-color: #8ca0e0;
}

.bg-color-gemgrab {
  background-color: #9b3df3;
}

.bg-color-biggame {
  background-color: #dc2423;
}

.bg-color-roborumble {
  background-color: #0085fb;
}

.bg-color-bossfight {
  background-color: #900020;
}

.bg-color-hotzone {
  background-color: #e33c50;
}
</style>
