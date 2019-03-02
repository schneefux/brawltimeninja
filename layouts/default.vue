<template>
  <div class="min-h-screen bg-primary-darkest text-grey-lighter flex flex-col justify-between">
    <nav class="bg-primary-dark p-6">
      <nuxt-link to="/" class="no-underline font-semibold text-xl text-white tracking-tight">
        {{ labels.appTitle }} Time Ninja
      </nuxt-link>
    </nav>

    <nuxt />

    <footer class="bg-primary-darker py-2 text-sm text-center leading-normal">
      <p>
        &#169; 2019 Online Time Ninja Project
      </p>
      <p class="text-xs leading-tight">{{ labels.disclaimer }}</p>
    </footer>
  </div>
</template>

<script>
const defaultLabels = {
  appTitle: 'Online',
  disclaimer: '',
}

export default {
  data() {
    return {
      labels: defaultLabels,
    }
  },
  watch: {
    '$route'() {
      this.updateLabels()
    },
  },
  mounted() {
    this.updateLabels()
  },
  methods: {
    updateLabels() {
      if (this.$route.params.app !== undefined) {
        this.$axios.$get(`/api/${this.$route.params.app}/labels`).then((labels) => { this.labels = labels })
      } else {
        this.labels = defaultLabels
      }
    },
  },
}
</script>
