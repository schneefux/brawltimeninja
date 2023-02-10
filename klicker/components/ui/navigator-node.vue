<template>
  <ul
    v-show="links.length > 0"
    class="grid gap-y-2 gap-x-2 grid-cols-[1.5rem,1fr]"
    role="group"
  >
    <li
      v-for="link in links"
      :key="link.id"
      :aria-expanded="expandedLinks[link.id]"
      class="contents"
      role="treeitem"
    >
      <button
        v-if="link.children != undefined && link.children.length > 0"
        v-bind-once="{ 'aria-controls': `${prefix}-${link.id}` }"
        class="col-start-1"
        @click="toggleLink(link)"
      >
        <fa
          v-if="expandedLinks[link.id]"
          :icon="faMinus"
          class="inline"
        ></fa>
        <fa
          v-else
          :icon="faPlus"
          class="inline"
        ></fa>
      </button>
      <slot
        v-if="link.target"
        :to="link.target"
        :title="link.name"
        name="link"
      ></slot>
      <span
        v-else
        class="col-start-2"
      >
        {{ link.name }}
      </span>
      <navigator-node
        v-if="link.children != undefined && link.children.length > 0"
        v-bind-once="{ id: `${prefix}-${link.id}` }"
        :links="expandedLinks[link.id] ? link.children : []"
        :expand-by-default="expandByDefault"
        class="ml-8 col-span-full"
      >
        <template v-slot:link="{ to, title }">
          <slot
            name="link"
            :to="to"
            :title="title"
          ></slot>
        </template>
      </navigator-node>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watchEffect } from 'vue'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { Link } from './b-navigator.vue'
import Fa from 'vue-fa'
import { generateId, BindOnce } from '../../directives/bind-once'

export default defineComponent({
  name: 'navigator-node',
  components: {
    Fa,
  },
  directives: {
    BindOnce,
  },
  props: {
    links: {
      type: Array as PropType<Link[]>,
      required: true
    },
    expandByDefault: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const expandedLinks = ref<Record<string, boolean>>({})

    const toggleLink = (link: Link) => {
      expandedLinks.value = {
        ...expandedLinks.value,
        [link.id]: !expandedLinks.value[link.id],
      }
    }

    watchEffect(() => {
      expandedLinks.value = props.links.reduce((map, link) => ({
        ...map,
        [link.id]: link.expanded ?? props.expandByDefault,
      }), {})
    })

    const prefix = generateId()

    return {
      toggleLink,
      expandedLinks,
      faMinus,
      faPlus,
      prefix,
    }
  },
})
</script>
