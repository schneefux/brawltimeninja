<script lang="ts">
import { defineComponent, h } from '@nuxtjs/composition-api'
import { useGtag } from '~/composables/gtag'
import { setInstallPrompt } from '~/composables/app'

export default defineComponent({
  setup() {
    const gtag = useGtag()

    if (process.client) {
      const installed = () => gtag.event('install', {
        'event_category': 'app',
        'event_label': 'install',
      })

      window.addEventListener('appinstalled', installed)
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        setInstallPrompt(e)
      })
    }

    return () => h()
  },
})
</script>
