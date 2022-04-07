<template>
  <ol
    class="flex flex-wrap space-x-2 my-1"
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
      <b-button
        :to="localePath(l.path)"
        :itemid="l.path"
        :dark="index == links.length - 1"
        :primary="index < links.length - 1"
        itemtype="https://schema.org/WebPage"
        itemprop="item"
        itemscope
        xs
      >
        <span itemprop="name">{{ l.name }}</span>
      </b-button>
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
