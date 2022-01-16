import { PropType } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse } from '.'

/**
 * Props definition for visualisation components
 */
export const VisualisationProps = {
  card: {
    type: undefined,
    required: false as false
  },
  loading: {
    type: Boolean,
    required: true as true
  },
  response: {
    type: Object as PropType<CubeResponse|CubeComparingResponse>,
    required: true as true
  },
}

/**
 * Props definition for visualisation or static components
 */
export const OptionalVisualisationProps = {
  ...VisualisationProps,
  loading: {
    type: Boolean,
    required: false as false
  },
  response: {
    // @ts-ignore
    type: Object as PropType<CubeResponse|CubeComparingResponse>,
    required: false as false
  },
}
