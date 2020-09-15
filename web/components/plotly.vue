<template>
  <div ref="graph"></div>
</template>

<script>
export default {
  props: {
    traces: {
      type: Array,
      required: true
    },
    layout: {
      type: Object,
      default: {}
    },
    options: {
      type: Object,
      default: {}
    },
  },
  data() {
    return {
      plot: undefined,
    }
  },
  mounted() {
    if (process.client) {
      this.refresh()
    }
  },
  methods: {
    refresh() {
      this.$plotly.react(this.$refs.graph, this.traces, this.layout, this.options)
    },
  },
  watch: {
    traces: 'refresh',
    layout: 'refresh',
    options: 'refresh',
  },
}
</script>
