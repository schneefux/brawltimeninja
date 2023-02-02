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
import { defineComponent, ref, onMounted } from 'vue'
// @ts-ignore
import { Timeline } from '@jacksongross/vue-tweet-embed'
import { useApi, useCacheHeaders, useMeta } from '@/composables/compat'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    Timeline,
  },
  setup() {
    const i18n = useI18n()

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('status.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('status.meta.description') },
      ]
    }))

    const $api = useApi()

    const status = ref<undefined|string>()
    onMounted(async () => {
      try {
        await $api.player.byTag.query('V8LLPPC')
        status.value = 'up'
      } catch {
        status.value = 'down'
      }
    })

    return {
      status,
    }
  },
})
</script>
