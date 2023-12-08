<template>
  <b-page :title="$t('install.title')">
    <b-page-section>
      <ol class="flex flex-wrap justify-center gap-8">
        <li>
          <b-card :title="$t('install.ios.tap-share')">
            <template v-slot:content>
              <img
                :src="Step1"
                class="w-80 max-w-full"
              >
            </template>
          </b-card>
        </li>
        <li>
          <b-card :title="$t('install.ios.add-to-home')">
            <template v-slot:content>
              <img
                :src="Step2"
                class="w-80 max-w-full"
              >
            </template>
          </b-card>
        </li>
        <li>
          <b-card :title="$t('install.ios.confirm')">
            <template v-slot:content>
              <img
                :src="Step3"
                class="w-80 max-w-full"
              >
            </template>
          </b-card>
        </li>
      </ol>
    </b-page-section>
  </b-page>
</template>

<script lang="ts">
import { useCacheHeaders } from '~/composables/compat';
import { defineComponent } from 'vue';
import { BPage, BPageSection, BCard } from '@schneefux/klicker/components';
import Step1 from '~/assets/images/install/ios-1_arrow.jpg';
import Step2 from '~/assets/images/install/ios-2_arrow.jpg';
import Step3 from '~/assets/images/install/ios-3_arrow.jpg';

export default defineComponent({
  components: {
    BPage,
    BPageSection,
    BCard,
  },
  setup() {
    useCacheHeaders()

    return {
      Step1,
      Step2,
      Step3,
    }
  }
})
</script>
