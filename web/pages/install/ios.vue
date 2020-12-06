<template>
  <page title="Adding Brawl Time Ninja to your Home Screen">
    <ol class="flex flex-wrap justify-center">
      <li>
        <card
          title="1. Tap the &quot;Share&quot; Icon"
          xs
        >
          <img
            slot="content"
            src="~/assets/images/install/ios-1_arrow.jpg"
          >
        </card>
      </li>
      <li>
        <card
          title="2. &quot;Add to Home Screen&quot;"
          xs
        >
          <img
            slot="content"
            src="~/assets/images/install/ios-2_arrow.jpg"
          >
        </card>
      </li>
      <li>
        <card
          title="3. &quot;Add&quot;"
          xs
        >
          <img
            slot="content"
            src="~/assets/images/install/ios-3_arrow.jpg"
          >
        </card>
      </li>
    </ol>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  middleware: ['cached'],
})
</script>
