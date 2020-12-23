<template>
  <fake-select>
    <template v-slot:preview>
      {{ formattedValue }}
    </template>

    <client-only>
      <div class="space-y-1">
        <b-button
          v-for="(name, preset) in presetMap"
          :key="preset"
          :selected="preset == value"
          dark
          sm
          @click="setPreset(preset)"
        >
          Current {{ name }}
        </b-button>
        <b-button
          :selected="!(value in presetMap)"
          dark
          sm
          @click="showSeasonSlider = true"
        >Since...</b-button>
      </div>
      <season-slider
        v-if="showSeasonSlider"
        :value="value"
        @input="e => $emit('input', e)"
        class="mt-10"
      ></season-slider>
    </client-only>
  </fake-select>
</template>

<script lang="ts">
import { format, parseISO } from 'date-fns'
import Vue from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showSeasonSlider: false,
    }
  },
  computed: {
    presetMap(): Record<string, string> {
      return this.$clicker.timePresets
    },
    formattedValue(): string {
      if (this.value in this.$clicker.timePresets) {
        return 'Current ' + this.$clicker.timePresets[this.value]
      }
      return 'Since ' + format(parseISO(this.value), 'PP')
    },
  },
  methods: {
    setPreset(p) {
      this.showSeasonSlider = false
      this.$emit('input', p)
    },
  },
})
</script>
