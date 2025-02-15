import { KlickerService } from '../service'
import config from './klicker.cubes'
import en from './en.json'
import { provide, Ref, shallowRef } from 'vue'
import { AsyncQuery, KlickerConfigInjectionKey } from '../composables/klicker'

export function translate(key: string) {
  if (key in en) {
    return en[key]
  }
  console.log('Missing translation for ' + key)
  return key
}

export class KlickerServiceMock extends KlickerService {
  constructor() {
    super('https://cube.brawltime.ninja', () => Promise.resolve(''), config, [], [], [], [], [], window.fetch.bind(window))
  }
}

let $klicker = new KlickerServiceMock()

export const useKlickerConfig = () => ({ $klicker, translate })

export function decorator(story, { parameters }) {
  let klicker = parameters?.$klicker ?? new KlickerServiceMock()

  return {
    components: { story },
    template: '<story />',
    setup() {
      provide(KlickerConfigInjectionKey, {
        klicker,
        translate,
        useQuery: function<T, E>(key: Ref<string>, handler: () => Promise<T>): AsyncQuery<T, E> {
          const data = shallowRef<T|null>(null) // https://github.com/vuejs/core/issues/1324#issuecomment-859766527
          const error = shallowRef<E|null>(null)
          const loading = shallowRef(false)

          function refresh() {
            return handler().then((result) => {
              data.value = result
            }).catch((err) => {
              error.value = err
            }).finally(() => {
              loading.value = false
            })
          }

          refresh()

          return {
            loading,
            data,
            error,
            refresh,
          }
        },
        navigate: async (path: string) => {
          alert('Navigating to ' + path)
        },
        managerUrl: '',
        linkComponent: 'a'
      })
    },
  }
}
