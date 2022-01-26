import Klicker from '../service'
import config from './klicker.conf'

export const useKlicker = () => {
  if ('$klicker' in window) {
    return { $klicker: (<any>window).$klicker }
  }

  const $klicker = new Klicker('https://cube.brawltime.ninja', config, [], [], []);
  (<any>window).$klicker = $klicker

  return { $klicker }
}
