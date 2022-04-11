<script lang="ts">
import { defineComponent, h, useStore } from '@nuxtjs/composition-api'
import { useGtag } from '~/composables/gtag'

export default defineComponent({
  setup() {
    const store = useStore()
    const gtag = useGtag()

    if (process.client) {
      const installed = () => gtag.event('install', {
        'event_category': 'app',
        'event_label': 'install',
      })

      window.addEventListener('appinstalled', installed)
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        store.commit('setInstallPrompt', e)
      })
    }

    return () => h()
  },
})
</script>
