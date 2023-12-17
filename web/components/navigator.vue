<template>
  <b-search
    ref="search"
    v-model="popupOpen"
    :input-class="inputClass"
    container-class=""
    popup-class="top-14 bottom-14 lg:bottom-0 h-[calc(100vh-2*3.5rem)] lg:h-[calc(100vh-3.5rem)] w-screen lg:max-w-md z-30"
    @enter="goToFirstResult"
  >
    <template v-slot="{ query }">
      <navigator-popup
        v-model="popupOpen"
        ref="navigatorPopup"
        :query="query"
      ></navigator-popup>
    </template>
  </b-search>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { BSearch } from '@schneefux/klicker/components'
import { useRoute, useRouter } from 'vue-router'
import NavigatorPopup from '~/components/navigator-popup.vue'

export default defineComponent({
  components: {
    BSearch,
    NavigatorPopup,
  },
  props: {
    inputClass: {
      type: String,
      default: '',
    },
  },
  setup() {
    const popupOpen = ref(false)

    const route = useRoute()
    const search = ref<InstanceType<typeof BSearch>>()
    watch(route, () => {
      popupOpen.value = false
      search.value?.reset()
    })

    const navigatorPopup = ref<InstanceType<typeof NavigatorPopup>>()
    const router = useRouter()
    const goToFirstResult = () => {
      const navigator = navigatorPopup.value?.navigator
      if (navigator == undefined) {
        return
      }

      const firstLink = navigator.searchResults
        .concat(navigatorPopup.value!.linkTree)
        .map(l => l.target)
        .find((l): l is string => l != undefined)

      if (firstLink != undefined) {
        router.push(firstLink)
      }
    }

    return {
      navigatorPopup,
      goToFirstResult,
      popupOpen,
      search,
    }
  },
})
</script>
