import { StaticWidgetSpec } from '@schneefux/klicker/types'
import { defineAsyncComponent } from 'vue'

const staticWidgets: StaticWidgetSpec[] = [{
  name: 'Image',
  component: 'v-media-img',
  import: defineAsyncComponent(() => import('~/components/klicker/v-media-img.vue')),
  initialDimensions: {
    rows: 2,
    columns: 2,
  },
  scalable: true,
  props: {
    path: {
      name: 'Path',
      component: 'b-textbox',
      import: defineAsyncComponent(() => import('@schneefux/klicker/components/ui/b-textbox.vue')),
      props: {
        dark: true,
      },
    },
  },
}]

export default staticWidgets
