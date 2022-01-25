import { StaticWidgetSpec } from 'klicker/types'

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
      import: async () => (await import('klicker')).BTextbox,
      props: {
        dark: true,
      },
    },
  },
}]

export default staticWidgets
