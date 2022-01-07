<template>
  <dl class="flex justify-between">
    <dt class="text-center mr-1">
      <span class="text-lg font-semibold">Balance Rating:</span><br>
      <span class="text-xs">How diverse is the Meta?</span>
    </dt>
    <dd class="text-center ml-1">
      <c-query :query="query">
        <template v-slot="data">
          <v-gini v-bind="data"></v-gini>
        </template>
      </c-query>
    </dd>
  </dl>
</template>

<script lang="ts">
import { CQuery } from '~/klicker/components'
import VGini from '~/components/klicker/v-gini.vue'
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { CubeQuery, SliceValue } from '~/klicker'

export default defineComponent({
  components: {
    CQuery,
    VGini,
  },
  props: {
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const query = computed(() => (<CubeQuery>{
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      measurementsIds: ['useRate'],
      slices: props.slices,
      sortId: 'useRate',
    }))

    return {
      query,
    }
  }
})
</script>
