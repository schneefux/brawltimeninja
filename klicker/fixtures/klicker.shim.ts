import Klicker from '../service'
import config from './klicker.conf'
import en from './en.json'

export function translate(key: string) {
  if (key in en) {
    return en[key]
  }
  console.log('Missing translation for ' + key)
  return key
}

export class MockedKlicker extends Klicker {
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

let $klicker = new MockedKlicker()

export const useKlicker = () => ({ $klicker, translate })

export function decorator(story, { parameters }) {
  if (parameters && parameters.$klicker) {
    $klicker = parameters.$klicker
  }

  return story()
}
