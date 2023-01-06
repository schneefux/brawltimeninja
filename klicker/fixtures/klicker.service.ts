import KlickerService from '../service'
import config from './klicker.cubes'
import en from './en.json'
import { provide } from 'vue'
import { KlickerConfigInjectionKey } from '../composables/klicker'

export function translate(key: string) {
  if (key in en) {
    return en[key]
  }
  console.log('Missing translation for ' + key)
  return key
}

export class KlickerServiceMock extends KlickerService {
  constructor() {
    super('https://cube.brawltime.ninja', config, [], [], [], [], [])
  }

  $t(key: string, args?: any) {
    return translate(key)
  }

  $te(key: string)  {
    return key in en
  }
}

let $klicker = new KlickerServiceMock()

export const useKlicker = () => ({ $klicker, translate })

export function decorator(story, { parameters }) {
  let klicker = parameters?.$klicker ?? new KlickerServiceMock()

  return {
    components: { story },
    template: '<story />',
    setup() {
      provide(KlickerConfigInjectionKey, {
        klicker,
        translate,
        exceptionLogger: () => {},
      })
    },
  }
}
