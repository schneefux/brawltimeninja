<template>
  <b-card
    :title="accessory.name"
    :icon="icon"
    :icon-alt="accessory.name"
  >
    <template v-slot:icon="data">
      <media-img-icon v-bind="data"></media-img-icon>
    </template>

    <template v-slot:content>
      <div class="h-full flex flex-col justify-between gap-y-4">
        <p>
          <q class="italic">{{ accessory.description }}</q>
        </p>

        <c-query :query="query">
          <template v-slot="data">
            <v-kv-table
              v-bind="data"
              class="mt-8 w-full"
            ></v-kv-table>
          </template>
        </c-query>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ScrapedAccessory } from '~/model/Web'
import { BCard, CQuery, VKvTable } from '@schneefux/klicker/components'
import { useI18n } from 'vue-i18n'
import { CubeComparingQuery } from '@schneefux/klicker/types'

export default defineComponent({
  components: {
    BCard,
    CQuery,
    VKvTable,
  },
  props: {
    accessory: {
      type: Object as PropType<ScrapedAccessory>,
      required: true
    },
    prop: {
      type: String as PropType<'starpowers'|'gadgets'>,
      required: true
    },
  },
  setup(props) {
    const icon = computed(() => `/${props.prop.toLowerCase()}/${props.accessory.id}`)

    const i18n = useI18n()
    const query = computed<CubeComparingQuery>(() => ({
      name: props.accessory.name,
      // materialized cubes are already filtered for <= 1 star powers owned
      cubeId: props.prop == 'gadgets' ? 'gadget' : 'starpower',
      dimensionsIds: ['brawler', props.prop == 'gadgets' ? 'gadget' : 'starpower'],
      metricsIds: ['winRate'],
      slices: {
        [props.prop == 'gadgets' ? 'gadgetIdEq' : 'starpowerIdEq']: [props.accessory.id],
      },
      sortId: 'winRate',
      comparing: true,
      reference: {
        name: props.prop == 'gadgets' ? i18n.t('brawler.no-gadget') : i18n.t('brawler.no-starpower'),
        cubeId: props.prop == 'gadgets' ? 'gadget' : 'starpower',
        dimensionsIds: ['brawler'],
        metricsIds: ['winRate'],
        slices: {
          [props.prop == 'gadgets' ? 'gadgetIdEq' : 'starpowerIdEq']: ['0'],
        },
        sortId: 'winRate',
      },
    }))

    return {
      icon,
      query,
    }
  },
})
</script>
