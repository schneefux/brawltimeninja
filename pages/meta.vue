<template>
  <div class="mx-auto py-4 px-2">
    <div class="bg-grey-lighter py-8 px-6 my-8 text-black">
      <h1 class="text-4xl md:text-center mt-2 font-semibold">
        Meta
      </h1>

      <table class="mt-8 table">
        <caption class="mb-1">
          Average Trophy statistics from Pros on Brawl Time Ninja this week
        </caption>
        <thead>
          <tr>
            <th scope="col" class="text-right">
              #
            </th>
            <th scope="col" class="text-left">
              Name
            </th>
            <th
              v-for="(label, id) in statLabels"
              :key="id"
              scope="col"
              class="text-right whitespace-no-wrap"
              @click="sortBy(id)"
            >
              <span v-if="comparator === id">
                <template v-if="order < 0">▲</template>
                <template v-else>▼</template>
              </span>
              <span v-else>&nbsp;&nbsp;&nbsp;</span>
              <span class="underline">{{ statLabels[id] }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, index) in sortedMeta"
            :key="entry.name"
          >
            <th scope="row" class="text-right">
              {{ index + 1 }}
            </th>
            <td class="font-semibold">
              {{ entry.name }}
            </td>
            <td
              v-for="(label, id) in statLabels"
              :key="id"
              class="text-center"
            >
              {{ Math.round(entry[id]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'MetaPage',
  head() {
    return {
      title: 'Meta',
    }
  },
  data() {
    const compareProp = (prop) => {
      return (e1, e2) => this.order * (e2[prop] - e1[prop])
    }
    const comparators = {
      trophies: compareProp('trophies'),
      spTrophies: compareProp('spTrophies'),
      trophyChange: compareProp('trophyChange'),
    }
    const statLabels = {
      trophies: 'Trophies',
      spTrophies: 'With Star Power',
      trophyChange: '1 week +/-',
    }

    return {
      comparator: 'trophies',
      order: +1,
      comparators,
      statLabels,
    }
  },
  computed: {
    sortedMeta() {
      const meta = this.meta.slice()
      return meta.sort(this.comparators[this.comparator])
    },
    ...mapState({
      meta: state => state.meta,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadMeta')
    }
  },
  mounted() {
    if (process.static) {
      this.loadMeta()
    }
  },
  methods: {
    sortBy(identifier) {
      if (this.comparator === identifier) {
        this.order *= -1
      } else {
        this.comparator = identifier
        this.order = +1
      }
    },
    ...mapActions({
      loadMeta: 'loadMeta',
    }),
  },
}
</script>

<style scoped>
.table th {
  @apply py-2 px-2;
}

.table td {
  @apply py-4 px-2;
}

.table tbody td, tbody th {
  @apply border-t border-grey-light;
}
</style>
