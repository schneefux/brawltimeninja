import { PropType } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse } from '.'

/**
 * Props definition for static components
 */
export const StaticProps = {
  card: {
    type: undefined,
    required: false as false
  },
}

/**
 * Props definition for visualisation components
 */
export const VisualisationProps = {
  ...StaticProps,
  loading: {
    type: Boolean,
    required: true as true
  },
  response: {
    type: Object as PropType<CubeResponse|CubeComparingResponse>,
    required: true as true
  },
}
