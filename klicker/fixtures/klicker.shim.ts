import Klicker from '../service'
import config from './klicker.conf'
import en from './en.json'

export const useKlicker = () => {
  if ('$klicker' in window) {
    return { $klicker: (<any>window).$klicker }
  }

  const $klicker = new Klicker('https://cube.brawltime.ninja', config, [], [], [], [], [])

  const translate = (key: string) => {
    if (key in en) {
      return en[key]
    }
    console.log('Missing translation for ' + key)
    return key
  }
  $klicker.$t = translate
  $klicker.$te = (key: string) => key in en;
  (<any>window).$klicker = $klicker

  return { $klicker, translate }
}
