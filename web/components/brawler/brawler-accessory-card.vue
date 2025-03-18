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
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ScrapedAccessory } from '~/model/Web'
import { BCard } from '@schneefux/klicker/components'
import { useI18n } from 'vue-i18n'
import { CubeComparingQuery } from '@schneefux/klicker/types'

export default defineComponent({
  components: {
    BCard,
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

    return {
      icon,
    }
  },
})
</script>
