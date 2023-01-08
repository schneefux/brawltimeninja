import { StaticWidgetSpec } from '@schneefux/klicker/types'

const staticWidgets: StaticWidgetSpec[] = [{
  name: 'Image',
  component: 'v-media-img',
  import: () => import('~/components/klicker/v-media-img.vue'),
  initialDimensions: {
    rows: 2,
    columns: 2,
  },
  scalable: true,
  props: {
    path: {
      name: 'Path',
      component: 'b-textbox',
      import: () => import('@schneefux/klicker/components/ui/b-textbox.vue'),
      props: {
        dark: true,
      },
    },
  },
}]

export default staticWidgets
