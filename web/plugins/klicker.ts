import { BButton, BCard, BCheckbox, BLightbox, BPage, BPageSection, BRadio, BScrollingDashboard, BSelect, BShimmer, CQuery } from '@schneefux/klicker/components'
import { KlickerConfigInjectionKey } from '@schneefux/klicker/composables/klicker'
import { App, Ref, onServerPrefetch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { BrawltimeKlickerService } from './klicker.service'
import { Router } from 'vue-router'
import { useSentry } from '@/composables/compat'

export default { install }
export { createClient }

interface Options {
  cubeUrl: string
  managerUrl: string
  translate: (key: string, args: any) => string
  router: Router
}

function createClient(options: Options) {
  return new BrawltimeKlickerService(options.cubeUrl, import.meta.env.SSR ? fetch : window.fetch.bind(window)) // fetch requires window as `this`
}

function install(app: App, options: Options) {
  app.component('c-query', CQuery)
  app.component('b-shimmer', BShimmer)
  app.component('b-card', BCard)
  app.component('b-button', BButton)
  app.component('b-select', BSelect)
  app.component('b-lightbox', BLightbox)
  app.component('b-checkbox', BCheckbox)
  app.component('b-radio', BRadio)
  app.component('b-page', BPage)
  app.component('b-page-section', BPageSection)
  app.component('b-scrolling-dashboard', BScrollingDashboard)

  const service = createClient(options)

  app.provide(KlickerConfigInjectionKey, {
    klicker: service,
    managerUrl: options.managerUrl,
    translate: options.translate,
    useQuery: function<T, E>(key: Ref<string>, handler: () => Promise<T>) {
      const sentry = useSentry()
      const query = useQuery<T, E>([key], handler, {
        keepPreviousData: true,
        onError(err) {
          sentry.captureException(err)
        },
      })
      onServerPrefetch(query.suspense)

      return {
        loading: query.isFetching,
        data: query.data as Ref<T|null>,
        error: query.error as Ref<E|null>,
        refresh: async () => { await query.refetch() },
      }
    },
    navigate: (to) => options.router.push(to),
    linkComponent: 'router-link',
  })
}
