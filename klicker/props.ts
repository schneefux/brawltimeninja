import { PropType } from 'vue'
import { CubeComparingResponse, CubeResponse } from './types'

export type CardProps = Partial<{
  // TODO infer these
  tag: string
  link: string
  title: string
  titleLink: string
  subtitle: string
  subtitleLink: string
  background: string
  icon: string
  iconAlt: string
  color: string
  textColor: string
  dense: boolean
  elevation: number
  loading: boolean
  noFilter: boolean
}>

export type BigstatProps = Partial<{
  title: string
  value: number|string
  tooltip: string
  tooltipLink: string
}>

/**
 * Props definition for static components
 */
export const StaticProps = {
  card: {
    type: Object as PropType<CardProps|BigstatProps|false>,
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
