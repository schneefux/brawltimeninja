import Klicker from '../service'
import config from './klicker.conf'

export const useKlicker = () => {
  const $klicker = new Klicker('https://cube.brawltime.ninja', config, [], [], [])

  return { $klicker }
}
