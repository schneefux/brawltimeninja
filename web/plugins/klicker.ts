import { BButton, BCard, BCheckbox, BLightbox, BPage, BPageSection, BRadio, BScrollingDashboard, BSelect, BShimmer, CQuery } from '@schneefux/klicker/components'
import { KlickerConfigInjectionKey } from '@schneefux/klicker/composables/klicker'
import { App, Ref, onServerPrefetch } from 'vue'
import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import { BrawltimeKlickerService } from './klicker.service'
import { Router } from 'vue-router'

export default { install }
export { createClient }

interface Options {
  cubeUrl: string
  managerUrl: string
  translate: (key: string, args: any) => string
  tokenProvider: () => Promise<string|undefined>
  fetch: typeof fetch
  router: Router
}

function createClient(options: Options) {
  return new BrawltimeKlickerService(
    options.cubeUrl,
    options.tokenProvider,
    options.fetch,
  )
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
      const query = useQuery<T, E>({
        queryKey: [key],
        queryFn: handler,
        placeholderData: keepPreviousData,
      })
      // FIXME workaround for https://github.com/TanStack/query/issues/6606
      onServerPrefetch(() => query.suspense().catch(() => {}))

      return {
        loading: query.isFetching,
        data: query.data as Ref<T|null>,
        error: query.error as Ref<E|null>,
        refresh: async () => { await query.refetch() },
      }
    },
    navigate: async (to) => {
      await options.router.push(to)
    },
    linkComponent: 'router-link',
  })
}
