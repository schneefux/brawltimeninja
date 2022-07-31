<template>
  <nav>
    <navigator-node
      :links="searchResults"
      expand-by-default
      role="tree"
    >
      <template v-slot:link="{ to, title }">
        <slot
          :to="to"
          :title="title"
          name="link"
        >
          <a
            :href="to"
            class="underline col-start-2"
          >{{ title }}</a>
        </slot>
      </template>
    </navigator-node>

    <hr
      v-if="search != undefined && search.length > 0"
      class="my-4"
    >

    <navigator-node
      :links="links"
      role="tree"
    >
      <template v-slot:link="{ to, title }">
        <slot
          :to="to"
          :title="title"
          name="link"
        >
          <a
            :href="to"
            class="underline col-start-2"
          >{{ title }}</a>
        </slot>
      </template>
    </navigator-node>
  </nav>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import NavigatorNode from './navigator-node.vue'

export interface Link {
  id: string
  name: string
  target?: string
  children?: Link[]
  expanded?: boolean
}

export default defineComponent({
  components: {
    NavigatorNode,
  },
  props: {
    links: {
      type: Array as PropType<Link[]>,
      required: true
    },
    linkGenerator: {
      type: Function as PropType<(input: string) => Link[]>,
      required: false
    },
    search: {
      type: String,
      required: false
    },
  },
  setup(props) {
    const searchResults = computed(() => {
      if (props.search == undefined) {
        return []
      }

      const matches: {
        depth: number,
        link: Link,
      }[] = []

      const searchWords = props.search.toLowerCase().split(' ')

      const recurse = (links: Link[], parents: Link[] = []) => {
        for (const link of links) {
          recurse(link.children ?? [], parents.concat(link))

          const words = parents.concat(link).flatMap(l => l.name.toLowerCase().split(' '))
          const foundAllWords = searchWords.every(sw => words.some(w => w.startsWith(sw)))

          if (props.search!.length > 0 && foundAllWords) {
            const name = parents.concat(link).map(l => l.name).join(' / ')
            matches.push({
              depth: parents.length,
              link: {
                id: link.id,
                target: link.target,
                name,
              },
            })
          }
        }
      }

      recurse(props.links)

      const dynamicResults = props.linkGenerator ? props.linkGenerator(props.search) : []

      return matches
        .sort((a, d) => a.depth - d.depth)
        .map(m => m.link)
        .slice(0, 10)
        .concat(dynamicResults)
    })

    return {
      searchResults,
    }
  },
})
</script>
