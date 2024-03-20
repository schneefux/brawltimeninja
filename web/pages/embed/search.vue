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
        class="w-48 text-black uppercase placeholder:normal-case font-semibold appearance-none focus:outline-none ml-3 mr-2"
      >
      <b-button
        type="submit"
        class="mr-3"
        primary
        lg
      >{{ $t('action.search') }}</b-button>
    </div>
    <p
      v-show="!tagValid"
      class="mt-2 -mb-4 text-red-500 w-full text-center"
    >
      {{ $t('error.tag.invalid') }}
    </p>
  </form>
</template>

<script lang="ts">
import { useCacheHeaders } from '~/composables/compat'
import { defineComponent, ref, computed } from 'vue'
import { tagPattern } from '~/lib/util'
import { event } from 'vue-gtag'
import { BButton } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BButton,
  },
  setup() {
    useCacheHeaders()

    const tagValid = ref(true)
    const tag = ref<string>()

    const cleanedTag = computed(() =>
      (tag.value || '')
        .trim()
        .replace('#', '')
        .toUpperCase()
        .replace(/O/g, '0')
    )

    function search(e: Event) {
      tagValid.value = tagPattern.test(cleanedTag.value)

      if (tagValid.value) {
        event('embedded_search_success')
      } else {
        e.preventDefault()
        event('embedded_search_invalid')
      }

      return tagValid.value
    }

    return {
      tag,
      search,
      tagValid,
      cleanedTag,
    }
  },
})
</script>

<style>
.placeholder\:normal-case::placeholder {
  @apply normal-case;
}
</style>

<route>
{
  meta: {
    layout: 'empty',
  },
}
</route>
