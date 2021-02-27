<template>
  <page-dashboard title="Brawl Stars Meta Dashboard">
    <c-dashboard
      v-model="state"
      :config="config"
      class="mt-2"
    >
      <template v-slot:dimensions="data">
        <d-brawler v-bind="data"></d-brawler>
        <d-team v-bind="data"></d-team>
        <d-mode v-bind="data"></d-mode>
        <d-map v-bind="data"></d-map>
        <d-season v-bind="data"></d-season>
        <d-player v-bind="data"></d-player>
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
import config, { State } from '~/lib/cube'
import CDashboard from '@/components/clicker/c-dashboard.vue'
import DBrawler from '@/components/clicker/renderers/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import DTeam from '@/components/clicker/renderers/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import DMode from '@/components/clicker/renderers/d-mode.vue'
import DMap from '@/components/clicker/renderers/d-map.vue'
import DSeason from '@/components/clicker/renderers/d-season.vue'
import DPlayer from '@/components/clicker/renderers/d-player.vue'
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
    BrawlerLink, // dependency of DBrawler
    DTeam,
    BrawlerTeam, // dependency of DTeam
    DMode,
    DMap,
    DSeason,
    DPlayer,
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
      config,
    }
  },
  computed: {
    state: {
      get(): State {
        return this.$clicker.locationToState(this.$route, this.config)
      },
      set(s: State) {
        this.$router.push(this.$clicker.stateToLocation(s))
      }
    },
  },
})
</script>
