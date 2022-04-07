<template>
  <b-page :title="$t('install.title')">
    <b-page-section>
      <ol class="flex flex-wrap justify-center gap-8">
        <li>
          <b-card :title="$t('install.ios.tap-share')">
            <img
              slot="content"
              src="~/assets/images/install/ios-1_arrow.jpg"
              class="max-w-xs"
            >
          </b-card>
        </li>
        <li>
          <b-card :title="$t('install.ios.add-to-home')">
            <img
              slot="content"
              src="~/assets/images/install/ios-2_arrow.jpg"
              class="max-w-xs"
            >
          </b-card>
        </li>
        <li>
          <b-card :title="$t('install.ios.confirm')">
            <img
              slot="content"
              src="~/assets/images/install/ios-3_arrow.jpg"
              class="max-w-xs"
            >
          </b-card>
        </li>
      </ol>
    </b-page-section>
  </b-page>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  middleware: ['cached'],
})
</script>
