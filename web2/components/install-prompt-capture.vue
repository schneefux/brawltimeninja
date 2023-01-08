<script lang="ts">
import { defineComponent } from 'vue'
import { setInstallPrompt } from '~/composables/app'
import { event } from 'vue-gtag'

export default defineComponent({
  setup() {
    if (!import.meta.env.SSR) {
      const installed = () => event('install', {
        'event_category': 'app',
        'event_label': 'install',
      })

      window.addEventListener('appinstalled', installed)
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        setInstallPrompt(e)
      })
    }
  },
})
</script>
