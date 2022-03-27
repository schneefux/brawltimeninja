<template>
  <b-scrolling-dashboard>
    <template v-for="prop in ['gadgets', 'starpowers']">
      <template v-if="scrapedData != undefined">
        <c-dashboard-cell
          v-for="accessory in scrapedData[prop]"
          :key="prop + '-' + accessory.name"
          :rows="2"
          :columns="3"
        >
          <b-card
            :title="accessory.name"
            :icon="`/${prop.toLowerCase()}/${accessory.id}`"
            :icon-alt="accessory.name"
            full-height
          >
            <template v-slot:icon="data">
              <media-img-icon v-bind="data"></media-img-icon>
            </template>

            <div
              slot="content"
              class="h-full flex flex-col justify-between gap-y-4"
            >
              <p slot="content">
                <q class="italic">{{ accessory.description }}</q>
              </p>

              <c-query
                :query="{
                  name: accessory.name,
                  // materialized cubes are already filtered for <= 1 star powers owned
                  cubeId: prop == 'gadgets' ? 'gadget' : 'starpower',
                  dimensionsIds: ['brawler', prop == 'gadgets' ? 'gadget' : 'starpower'],
                  metricsIds: ['winRate'],
                  slices: {
                    [prop == 'gadgets' ? 'gadgetIdEq' : 'starpowerIdEq']: [accessory.id],
                  },
                  sortId: 'winRate',
                  comparing: true,
                  reference: {
                    name: prop == 'gadgets' ? $t('brawler.no-gadget') : $t('brawler.no-starpower'),
                    cubeId: prop == 'gadgets' ? 'gadget' : 'starpower',
                    dimensionsIds: ['brawler'],
                    metricsIds: ['winRate'],
                    slices: {
                      [prop == 'gadgets' ? 'gadgetIdEq' : 'starpowerIdEq']: ['0'],
                    },
                    sortId: 'winRate',
                  },
                }"
              >
                <template v-slot="data">
                  <v-kv-table
                    v-bind="data"
                    class="mt-8 w-full"
                  ></v-kv-table>
                </template>
              </c-query>
            </div>
          </b-card>
        </c-dashboard-cell>
      </template>

      <c-dashboard-cell
        v-else
        v-for="i in 2"
        :key="prop + '-' + i"
        :rows="2"
        :columns="3"
      ></c-dashboard-cell>
    </template>

    <c-dashboard-cell
      :rows="2"
      :columns="3"
    >
      <b-card
        :title="$t('info')"
        full-height
      >
        <p slot="content">
          {{ $t('starpower-gadget-comparison.info') }}
        </p>
      </b-card>
    </c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingDashboard, CDashboardCell, BCard, BKvTable, VKvTable, CQuery } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingDashboard,
    CDashboardCell,
    BKvTable,
    BCard,
    VKvTable,
    CQuery,
  },
  props: {
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: false
    },
  },
})
</script>