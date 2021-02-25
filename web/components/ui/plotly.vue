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
      default: () => {}
    },
    options: {
      type: Object,
      default: () => {}
    },
  },
  mounted() {
    this.refresh()
  },
  methods: {
    refresh() {
      if (!process.client) {
        return
      }
      this.$plotly.react(this.$refs.graph, this.traces, {
        plot_bgcolor: 'rgba(0, 0, 0, 0)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: {
          color: '#ffffff',
        },
        dragmode: false,
        ...this.layout
      }, {
        displayModeBar: false,
        responsive: true,
        ...this.options,
      })
    },
  },
  watch: {
    traces: 'refresh',
    layout: 'refresh',
    options: 'refresh',
  },
}
</script>
