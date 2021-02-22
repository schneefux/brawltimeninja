<template>
  <page-dashboard title="Brawl Stars Meta Dashboard">
    <c-dashboard
      :config="config"
      :default-cube="cube"
      :default-slices="slices"
      :default-dimensions="['brawler']"
      :default-measurements="['winRateAdj']"
      class="mt-2"
    >
      <template v-slot:dimensions="data">
        <d-brawler v-bind="data"></d-brawler>
        <d-team v-bind="data"></d-team>
        <d-starpower v-bind="data"></d-starpower>
        <d-gadget v-bind="data"></d-gadget>
        <d-mode v-bind="data"></d-mode>
        <d-map v-bind="data"></d-map>
      </template>
      <template v-slot:slices="data">
        <s-season v-bind="data"></s-season>
        <s-mode-map v-bind="data"></s-mode-map>
        <s-competition-maps v-bind="data"></s-competition-maps>
        <s-brawler v-bind="data"></s-brawler>
        <s-ally v-bind="data"></s-ally>
        <s-powerplay v-bind="data"></s-powerplay>
        <s-trophies v-bind="data"></s-trophies>
        <s-with-starpower v-bind="data"></s-with-starpower>
        <s-with-gadget v-bind="data"></s-with-gadget>
      </template>
      <template v-slot:visualisations="data">
        <v-sample-size v-bind="data"></v-sample-size>
        <v-last-update v-bind="data"></v-last-update>
        <v-moe v-bind="data"></v-moe>
        <v-gini v-bind="data"></v-gini>
        <v-measure-description v-bind="data"></v-measure-description>
      </template>
    </c-dashboard>
  </page-dashboard>
</template>

<script lang="ts">
import Vue from 'vue'
import config from '~/lib/cube'
import CDashboard from '@/components/clicker/c-dashboard.vue'
import DBrawler from '@/components/clicker/renderers/d-brawler.vue'
import DTeam from '@/components/clicker/renderers/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import DStarpower from '@/components/clicker/renderers/d-starpower.vue'
import DGadget from '@/components/clicker/renderers/d-gadget.vue'
import DMode from '@/components/clicker/renderers/d-mode.vue'
import DMap from '@/components/clicker/renderers/d-map.vue'
import SModeMap from '@/components/clicker/renderers/s-mode-map.vue'
import SCompetitionMaps from '@/components/clicker/renderers/s-competition-maps.vue'
import SAlly from '@/components/clicker/renderers/s-ally.vue'
import SSeason from '@/components/clicker/renderers/s-season.vue'
import SPowerplay from '@/components/clicker/renderers/s-powerplay.vue'
import STrophies from '@/components/clicker/renderers/s-trophies.vue'
import SWithStarpower from '@/components/clicker/renderers/s-with-starpower.vue'
import SWithGadget from '@/components/clicker/renderers/s-with-gadget.vue'
import SBrawler from '@/components/clicker/renderers/s-brawler.vue'
import VGini from '@/components/clicker/renderers/v-gini.vue'
import VLastUpdate from '@/components/clicker/renderers/v-last-update.vue'
import VMoe from '@/components/clicker/renderers/v-moe.vue'
import VSampleSize from '@/components/clicker/renderers/v-sample-size.vue'
import VMeasureDescription from '@/components/clicker/renderers/v-measure-description.vue'

export default Vue.extend({
  components: {
    CDashboard,
    DBrawler,
    DTeam,
    BrawlerTeam, // dependency of DTeam
    DStarpower,
    DGadget,
    DMode,
    DMap,
    SModeMap,
    SCompetitionMaps,
    SAlly,
    SSeason,
    SPowerplay,
    STrophies,
    SWithStarpower,
    SWithGadget,
    SBrawler,
    VGini,
    VLastUpdate,
    VMoe,
    VSampleSize,
    VMeasureDescription,
  },
  data() {
    return {
      cube: 'map',
      config,
      slices: config['map'].defaultSliceValues,
    }
  },
  asyncData({ query, $clicker, route }) {
    const cube = query['cube'] as string || 'map'
    return {
      cube,
      slices: $clicker.routeToSlices(route, config[cube].defaultSliceValues),
    }
  },
})
</script>
