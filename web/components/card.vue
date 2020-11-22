<template functional>
  <div class="card-wrapper">
    <accordeon
      v-if="props.pages != undefined"
      :pages="props.pages"
      class="card card--dark"
    >
      <template v-slot="accordeonSlotProps">
        <!-- pass props and slots down -->
        <card-content v-bind="data.attrs">
          <template
            v-for="(_, slot) of $scopedSlots"
            v-slot:[slot]="slotProps"
          >
            <slot
              v-bind="{ ...slotProps, ...accordeonSlotProps }"
              :name="slot"
            ></slot>
          </template>
        </card-content>
      </template>
    </accordeon>

    <div
      v-else
      class="card card--dark"
    >
      <card-content v-bind="data.attrs">
        <template
          v-for="(_, slot) of $scopedSlots"
          v-slot:[slot]="slotProps"
        >
          <slot
            :name="slot"
            v-bind="slotProps"
            :page="0"
            open
          ></slot>
        </template>
      </card-content>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    pages: {
      type: Number,
    },
  },
})
</script>
