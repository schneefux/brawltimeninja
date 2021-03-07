<template>
  <form
    :action="`/profile/${cleanedTag}`"
    class="w-full flex flex-wrap justify-center"
    target="_blank"
    @submit="search"
  >
    <div class="py-2 rounded-lg bg-yellow-400">
      <input
        v-model="tag"
        :placeholder="$t('action.enter-tag')"
        type="text"
        autocomplete="off"
        class="w-48 uppercase placeholder:normal-case font-semibold appearance-none focus:outline-none ml-3 mr-2"
      >
      <b-button
        tag="input"
        type="submit"
        class="mr-3"
        value="Search"
        primary
        lg
      ></b-button>
    </div>
    <p
      v-show="!tagValid"
      class="mt-2 -mb-4 text-red-500 w-full text-center"
    >
      {{ $t('error.tag.invalid') }}
    </p>
  </form>
</template>

<script>
import { mapState } from 'vuex'

export default {
  layout: 'empty',
  middleware: ['cached'],
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
        this.$gtag.event('search', {
          'event_category': 'embed',
          'event_label': 'success',
        })
      } else {
        event.preventDefault()
        this.$gtag.event('search', {
          'event_category': 'embed',
          'event_label': 'error_invalid',
        })
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
