<template>
  <div class="bg-yellow-400 text-gray-800 h-14 p-4 z-40 sticky top-0 flex items-center">
    <button
      @click="() => depth == 0 ? undefined : back()"
      class="h-6 w-6 mr-6"
    >
      <img
        v-if="depth == 0"
        src="~/assets/images/logo_with_crown_min.svg"
      >
      <font-awesome-icon
        v-else
        :icon="faArrowLeft"
        class="align-middle"
      ></font-awesome-icon>
    </button>
    <nuxt-link
      :to="localePath('/')"
      class="font-medium mr-auto leading-none text-xl"
      prefetch
    >
      {{ $t('nav.' + title) }}
    </nuxt-link>

    <install-button
      class="h-6 mr-1"
    ></install-button>

    <b-button
      :to="'/about'"
      class="w-6 text-center h-6 mr-1"
      primary
    >
      <font-awesome-icon
        :icon="faInfo"
      ></font-awesome-icon>
    </b-button>

    <locale-switcher
      class="h-6 !text-2xs pr-7"
    ></locale-switcher>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useRouter, useContext, watch } from '@nuxtjs/composition-api'
import { faInfo, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  setup(props, { root }) {
    const depth = ref(0)
    const title = ref('Brawl Time Ninja')

    const router = useRouter()
    const back = () => {
      depth.value -= 2
      router.go(-1)
    }

    const { route } = useContext()
    const update = () => {
      // TODO: update with Nuxt 3
      // $route.meta is merged into $nuxt.$options.context.route.meta
      // and not reactive
      // https://github.com/nuxt/nuxt.js/issues/5885#issuecomment-507670640

      const newTitle = root.$nuxt.$options.context.route.meta[0]?.title
      console.log(route.value.meta)
      if (newTitle != undefined) {
        title.value = newTitle
      }
    }

    update()

    watch(route, () => {
      depth.value++
      update()
    })

    return {
      back,
      depth,
      title,
      faArrowLeft,
      faInfo,
    }
  },
})
</script>
