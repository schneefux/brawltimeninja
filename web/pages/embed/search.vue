<template>
  <form
    :action="`/player/${cleanedTag}`"
    class="w-full flex flex-wrap justify-center"
    target="_blank"
    @submit="search"
  >
    <div class="link-card p-0!">
      <div class="py-2 rounded-lg bg-primary-light">
        <input
          v-model="tag"
          placeholder="Enter your Tag"
          type="text"
          autocomplete="off"
          class="w-32 tracking-wider uppercase placeholder:normal-case font-semibold appearance-none bg-transparent focus:outline-none ml-3 mr-2"
        >
        <input
          type="submit"
          class="button button--lg mr-3"
          value="Search"
        >
      </div>
      <p
        v-show="!tagValid"
        class="mt-2 -mb-4 text-red-500 w-full text-center"
      >
        This is not a tag.
      </p>
    </div>
  </form>
</template>

<script>
import { mapState } from 'vuex'

export default {
  layout: 'empty',
  data() {
    return {
      tag: undefined,
      tagValid: true,
    }
  },
  computed: {
    tagRegex() {
      return new RegExp(this.tagPattern)
    },
    cleanedTag() {
      return (this.tag || '')
        .trim()
        .replace('#', '')
        .toUpperCase()
        .replace(/O/g, '0')
    },
    ...mapState({
      tagPattern: state => state.tagPattern,
    }),
  },
  methods: {
    search(event) {
      this.tagValid = this.tagRegex.test(this.cleanedTag)

      if (this.tagValid) {
        this.$ga.event('embed', 'search', 'success')
      } else {
        event.preventDefault()
        this.$ga.event('embed', 'search', 'error_invalid')
      }

      return this.tagValid
    },
  },
}
</script>

<style>
.placeholder\:normal-case::placeholder {
  @apply normal-case;
}

.p-0\! {
  padding: 0;
}
</style>
