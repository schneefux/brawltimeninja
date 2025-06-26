<template>
  <div class="space-y-3">
    <div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-2">
      <div class="flex flex-wrap justify-center items-center gap-2">
        <b-button
          class="whitespace-nowrap"
          :secondary="!light"
          :light="light"
          xs
          @click="feedbackModalOpen = true"
        >{{ $t('feedback.feedback-cta' )}}</b-button>
        <b-button
          :secondary="!light"
          :light="light"
          href="https://discord.gg/uYfgznq"
          tag="a"
          xs
        >Discord</b-button>
        <b-button
          :secondary="!light"
          :light="light"
          href="https://twitter.com/brawltimeninja"
          tag="a"
          xs
        >Twitter</b-button>
        <b-button
          :secondary="!light"
          :light="light"
          xs
          @click="manageConsent()"
        >{{ $t('action.manage-consent') }}</b-button>
      </div>
    </div>
    <p>
      &#169; 2018 - 2025 Brawl Time Ninja
      ({{ releaseVersion }})
      <span v-if="$i18n.locale != 'en'">
        &mdash; {{ $t('footer.translated-by') }} {{ $t('translators') }}
      </span>
    </p>
    <p class="text-xs leading-tight">
      This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it. For more information see Supercell's Fan Content Policy: www.supercell.com/fan-content-policy.
    </p>
    <sentry-feedback v-model="feedbackModalOpen"></sentry-feedback>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    light: {
      type: Boolean,
      default: false
    },
  },
  setup() {
    const feedbackModalOpen = ref(false)

    const manageConsent = () => googlefc.callbackQueue.push({
      'CONSENT_DATA_READY': () => googlefc.showRevocationMessage()
    })

    return {
      manageConsent,
      feedbackModalOpen,
      releaseVersion: import.meta.env.VITE_GIT_REV.substring(0, 7)
    }
  },
})
</script>
