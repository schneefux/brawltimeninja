<template>
  <div
    ref="container"
    :class="containerClass"
    class="ml-4 inline-flex items-center"
  >
    <font-awesome-icon
      :icon="faSearch"
      class="-mr-6"
    ></font-awesome-icon>
    <b-textbox
      v-model="filter"
      ref="search"
      :class="inputClass"
      type="text"
      aria-label="search"
      class="pl-8 h-6 w-full"
      @focus="$emit('input', true)"
      @keyup.native.enter="$emit('enter')"
    ></b-textbox>

    <div
      v-if="value"
      ref="popup"
      class="absolute inset-x-0 z-10"
      :class="popupClass"
    >
      <slot :query="filter"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue-demi'
import BTextbox from './b-textbox.vue'
import BCard from './b-card.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

export default defineComponent({
  components: {
    FontAwesomeIcon,
    BTextbox,
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    containerClass: {
      type: String,
      default: 'relative'
    },
    inputClass: {
      type: String,
      default: ''
    },
    popupClass: {
      type: String,
      default: 'top-6'
    },
  },
  setup(props, { emit }) {
    const filter = ref('')

    const popup = ref<typeof BCard>()
    const container = ref<HTMLElement>()
    onClickOutside(popup as any, () => emit('input', false), {
      ignore: [container as any],
    })

    const search = ref<InstanceType<typeof BTextbox>>()
    onKeyStroke(
      (event) => (event.metaKey || event.ctrlKey) && event.key == 'k',
      () => {
        emit('input', true);
        (search.value!.$el as HTMLInputElement).focus()
      },
    )

    const reset = () => filter.value = ''

    return {
      container,
      popup,
      search,
      filter,
      faSearch,
      faTimes,
      reset,
    }
  },
})
</script>
