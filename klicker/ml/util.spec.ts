import { ProbabilityTable } from './types'
import { jpdToCpt } from './util'

const jpd: ProbabilityTable = {
  featureIds: ['x', 'y'],
  probabilities: new Map(Object.entries({
    '0;0': {
      values: ['0', '0'],
      probability: 4 / 9,
    },
    '1;0': {
      values: ['1', '0'],
      probability: 1 / 9,
    },
    '0;1': {
      values: ['0', '1'],
      probability: 2 / 9,
    },
    '1;1': {
      values: ['1', '1'],
      probability: 2 / 9,
    },
  })),
}

const expectedCpt: ProbabilityTable = {
  featureIds: ['x', 'y'],
  probabilities: new Map(Object.entries({
    '0;0': {
      values: ['0', '0'],
      probability: 4 / 6,
    },
    '1;0': {
      values: ['1', '0'],
      probability: 1 / 3,
    },
    '0;1': {
      values: ['0', '1'],
      probability: 2 / 6,
    },
    '1;1': {
      values: ['1', '1'],
      probability: 2 / 3,
    },
  })),
}

// TODO create proper unit test
if (JSON.stringify(expectedCpt) != JSON.stringify(jpdToCpt(jpd, 1))) {
  throw new Error('unit test failure')
}
