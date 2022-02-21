<template>
  <b-page :title="$t('status.title')">
    <div class="px-2 mt-8 mx-auto max-w-lg">
      <p v-show="status == undefined">{{ $t('state.checking') }}…</p>
      <div v-show="status == 'down'">
        <media-img path="/brawlers/spike_loss/model" clazz="mt-8 w-40 mx-auto" alt="Spike"></media-img>
        <h2 class="text-3xl font-bold text-center tracking-wide text-yellow-400">{{ $t('status.down.title') }}</h2>
        <p class="mt-6">{{ $t('status.down.description') }}</p>
      </div>
      <div v-show="status == 'up'">
        <h2 class="text-3xl font-bold text-center tracking-wide text-yellow-400">{{ $t('status.up.title') }}</h2>
        <media-img path="/brawlers/poco/model" clazz="mt-8 w-40 mx-auto" alt="Poco"></media-img>
        <p class="mt-6">{{ $t('status.up.description') }}</p>
      </div>

      <p v-show="status != undefined" class="mt-4">
        {{ $t('status.check-twitter') }}
      </p>

      <div class="mt-8">
        <Timeline id="BrawlStars" sourceType="profile" :options="{ theme: 'dark', height: 600, dnt: true }" />
      </div>
    </div>
  </b-page>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { Timeline } from 'vue-tweet-embed'

export default Vue.extend({
  head(): MetaInfo {
    const description = this.$tc('status.meta.description')
    return {
      title: this.$tc('status.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  components: {
    Timeline,
  },
  meta: {
    screen: 'guides',
  },
  data() {
    return {
      status: undefined as undefined|string,
    }
  },
  async created() {
    try {
      await this.$http.$get(this.$config.apiUrl + '/api/player/V8LLPPC')
      this.status = 'up'
    } catch {
      this.status = 'down'
    }
  },
})
</script>
