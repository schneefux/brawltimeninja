import { BButton, BCard, BCheckbox, BLightbox, BPage, BPageSection, BRadio, BScrollingDashboard, BSelect, BShimmer, CQuery } from '@schneefux/klicker/components'
import { KlickerConfigInjectionKey } from '@schneefux/klicker/composables/klicker'
import { App, Ref, onServerPrefetch } from 'vue'
import { useCached } from '@vueuse/core'
import { useQuery } from '@tanstack/vue-query'
import config from '@/lib/klicker.cubes'
import { BrawltimeKlickerService } from './klicker.service'
import { navigate } from 'vite-plugin-ssr/client/router'
import visualisations from '@/lib/klicker.visualisations.conf'
import staticWidgets from '@/lib/klicker.widgets.conf'
import slicers from '@/lib/klicker.slicers.conf'
import { dimensionRenderers, metricRenderers } from '@/lib/klicker.renderers'

export default { install }

function install(app: App, options: { cubeUrl: string, managerUrl: string, translate: (key: string, args: any) => string }) {
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

  const service = new BrawltimeKlickerService(options.cubeUrl, config, visualisations, staticWidgets, slicers, dimensionRenderers, metricRenderers)

  app.provide(KlickerConfigInjectionKey, {
    klicker: service,
    managerUrl: options.managerUrl,
    translate: options.translate,
    useQuery: function<T, E>(key: Ref<string>, handler: () => Promise<T>) {
      const query = useQuery<T, E>([key], handler)
      onServerPrefetch(query.suspense)

      return {
        loading: query.isLoading,
        data: query.data as Ref<T|null>,
        error: query.error as Ref<E|null>,
        refresh: async () => { await query.refetch() },
      }
    },
    navigate: navigate,
    linkComponent: 'router-link',
  })
}
