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
import { defineComponent, ref, useTemplateRef, watch } from 'vue'
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
    const searchRef = useTemplateRef<InstanceType<typeof BSearch>>('search')
    watch(route, () => {
      popupOpen.value = false
      searchRef.value?.reset()
    })

    const navigatorPopupRef = useTemplateRef<InstanceType<typeof NavigatorPopup>>('navigatorPopup')
    const router = useRouter()
    const goToFirstResult = async () => {
      const navigator = navigatorPopupRef.value?.navigatorRef
      if (navigator == undefined) {
        return
      }

      const firstLink = navigator.searchResults
        .concat(navigatorPopupRef.value!.linkTree)
        .map(l => l.target)
        .find((l): l is string => l != undefined)

      if (firstLink != undefined) {
        await router.push(firstLink)
      }
    }

    return {
      goToFirstResult,
      popupOpen,
    }
  },
})
</script>
