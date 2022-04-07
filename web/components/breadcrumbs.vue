<template>
  <ol
    class="flex flex-wrap space-x-2 my-4"
    itemtype="https://schema.org/BreadcrumbList"
    itemscope
  >
    <li
      v-for="(l, index) in links"
      :key="l.path"
      itemprop="itemListElement"
      itemtype="https://schema.org/ListItem"
      itemscope
    >
      {{ index > 0 ? '/' : '' }}
      <nuxt-link
        :to="localePath(l.path)"
        :itemid="l.path"
        itemtype="https://schema.org/WebPage"
        itemprop="item"
        class="underline"
        itemscope
      >
        <span itemprop="name">{{ l.name }}</span>
      </nuxt-link>
      <meta itemprop="position" :content="index + 1" />
    </li>
  </ol>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { BButton } from '@schneefux/klicker/components'

export interface BreadcrumbLink {
  path: string
  name: string
}

export default defineComponent({
  components: {
    BButton,
  },
  props: {
    links: {
      type: Array as PropType<BreadcrumbLink[]>,
    }
  },
})
</script>
