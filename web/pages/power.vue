<template>
  <div class="page container">
    <div class="flex flex-wrap justify-around">
      <label class="mt-2 ml-2">
        Select Cube:
        <select
          v-model="selectedCube"
          class="select"
        >
          <option
            v-for="cube in availableCubes"
            :key="cube"
            :value="cube"
          >
            {{ cube }}
          </option>
        </select>
      </label>

      <label class="mt-2 ml-2">
        Select Metric:
        <select
          v-model="selectedMetric"
          class="select"
        >
          <option
            v-for="metric in availableMeasures"
            :key="metric"
            :value="metric"
          >
            {{ metric }}
          </option>
        </select>
      </label>

      <label class="mt-2 ml-2">
        Sort by Metric:
        <select
          v-model="selectedSort"
          class="select"
        >
          <option
            v-for="metric in availableMeasures"
            :key="metric"
            :value="metric"
          >
            {{ metric }}
          </option>
        </select>
      </label>

      <label class="mt-2 ml-2">
        Select Dimension:
        <select
          v-model="selectedDimension"
          class="select"
        >
          <option
            v-for="dimension in availableDimensions"
            :key="dimension"
            :value="dimension"
          >
            {{ dimension }}
          </option>
        </select>
      </label>
    </div>

    <p
      v-if="error != ''"
      class="mt-6 text-red-500 text-center"
    >
      {{ error }}
    </p>

    <div class="mt-6 flex flex-wrap justify-center">
      <div class="w-full card card--dark">
        <plotly
          :options="graphOptions"
          :layout="graphLayout"
          :traces="graphTraces"
        ></plotly>
      </div>

      <div class="mt-4 mx-auto card card--dark card__content">
        <table>
          <thead>
            <tr>
              <th>{{ selectedDimension }}</th>
              <th>{{ selectedMetric }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in data"
              :key="index"
            >
              <td>{{ row[selectedDimension] }}</td>
              <td>{{ row[selectedMetric] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      data: [] as any[],
      totals: {} as any,
      error: '',
      selectedCube: 'map',
      availableMeasures: [] as string[],
      selectedMetric: 'battle_victory',
      selectedSort: 'battle_victory',
      availableDimensions: [] as string[],
      selectedDimension: 'brawler_name',
    }
  },
  watch: {
    selectedCube: 'queryMetadata',
    selectedMetric: 'query',
    selectedSort: 'query',
    selectedDimension: 'query',
  },
  created() {
    this.queryMetadata()
    this.query()
  },
  methods: {
    async queryMetadata() {
      const metadata = await this.$clicker.queryMetadata(this.selectedCube)
      this.availableMeasures = metadata.measures
      this.availableDimensions = metadata.dimensions

      this.selectedMetric = this.availableMeasures[0]
      this.selectedSort = this.availableMeasures[0]
      this.selectedDimension = this.availableDimensions[0]
    },
    async query() {
      try {
        this.error = ''
        const response = await this.$clicker.query(
          this.selectedCube,
          [this.selectedDimension],
          [this.selectedMetric],
          {},
          {
            sort: {
              [this.selectedSort]: 'desc',
            },
          })
        this.data = response.data
        this.totals = response.totals
      } catch (err) {
        console.log(err)
        this.error = 'Invalid Parameters'
      }
    },
  },
  computed: {
    availableCubes() {
      return this.$clicker.cubes
    },
    graphLayout(): object {
      return {
        xaxis: {
          title: this.selectedDimension,
          tickcolor: '#ffffff',
        },
        yaxis: {
          title: this.selectedMetric,
          tickcolor: '#ffffff',
        },
        margin: { t: 10, l: 55, b: 65, r: 10 },
        plot_bgcolor: 'rgba(0, 0, 0, 0)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        font: {
          color: '#ffffff',
        },
      }
    },
    graphOptions(): object {
      return {
        responsive: true,
      }
    },
    graphTraces(): object {
      return [{
        x: this.data.map((row) => row[this.selectedDimension]),
        y: this.data.map((row) => row[this.selectedMetric]),
        type: 'bar',
      }]
    },
  },
})
</script>

<style lang="postcss" scoped>
.select {
  @apply bg-primary hover:bg-primary-light rounded py-1 px-2 ml-2;
}
</style>
