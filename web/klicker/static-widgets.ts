import { StaticWidgetSpec } from "."

const defaultStaticWidgets: StaticWidgetSpec[] = [{
  name: 'Markdown',
  component: 'v-markdown',
  import: () => import('~/klicker/components/visualisations/v-markdown.vue'),
  initialDimensions: {
    rows: 4,
    columns: 4,
  },
  props: {
    markdown: {
      name: 'Markdown',
      component: 'b-markdown',
      import: () => import('~/klicker/components/ui/b-markdown.vue'),
      props: {
      },
    },
  },
}]

export default defaultStaticWidgets
