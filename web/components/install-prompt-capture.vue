<script lang="ts">
import Vue from 'vue'
import { mapMutations } from 'vuex'

export default Vue.extend({
  created() {
    if (process.client) {
      window.addEventListener('appinstalled', this.installed)
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.setInstallPrompt(e)
      })
    }
  },
  render(h) {
    return h()
  },
  methods: {
    installed() {
      this.$ga.event('app', 'install')
    },
    ...mapMutations({
      setInstallPrompt: 'setInstallPrompt',
    })
  }
})
</script>
