<template>
  <div class="mx-auto py-4 px-2">
    <div class="md:bg-grey-lighter py-8 px-6 my-8 md:text-black">
      <h1 class="text-4xl md:text-center mt-2 mb-6 font-semibold">
        Meta
      </h1>

      <table class="table hidden md:block">
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
            >
              <button
                class="font-bold"
                @click="sortBy(id)"
              >
                <span v-if="comparator === id">
                  <template v-if="order < 0">▲</template>
                  <template v-else>▼</template>
                </span>
                <span v-else>&nbsp;&nbsp;&nbsp;</span>
                <span class="underline">{{ statLabels[id] }}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(brawler, index) in sortedMeta"
            :key="brawler.id"
          >
            <th scope="row" class="text-right">
              {{ index + 1 }}
            </th>
            <td class="font-semibold">
              {{ brawler.name }}
              <img
                class="w-12 mt-1"
                :src="require(`~/assets/images/hero/icon/${brawler.id}_optimized.png`)"
              >
            </td>
            <td
              v-for="(label, prop) in statLabels"
              :key="prop"
              class="text-center"
            >
              {{ Math.round(brawler[prop]) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex flex-wrap justify-between md:hidden">
        <div class="text-center">
          <button
            v-for="(label, id) in statLabels"
            :key="id"
            class="mr-3 mb-2 bg-secondary border-secondary hover:bg-secondary-light hover:border-secondary-light text-black font-semibold text-sm border-2 rounded py-1 px-2"
            @click="sortBy(id)"
          >
            <span v-if="comparator === id">
              <template v-if="order < 0">▲</template>
              <template v-else>▼</template>
            </span>
            <span>{{ statLabels[id] }}</span>
          </button>
        </div>

        <div
          v-for="(brawler, index) in sortedMeta"
          :key="brawler.id"
          class="card-wrapper w-full md:flex-1"
        >
          <brawler-card
            :id="brawler.id"
            :name="brawler.name"
          >
            <template v-slot:history>
              <div class="h-12 text-right">
                <span class="font-semibold text-white text-2xl text-shadow">
                  #{{ index + 1}}
                </span>
              </div>
            </template>
            <template v-slot:stats>
              <table>
                <tr
                  v-for="(label, prop) in statLabels"
                  :key="prop"
                  class="card-props whitespace-no-wrap"
                >
                  <td class="text-center">
                    <img
                      :src="require(`~/assets/images/icon/${statIcons[prop]}.png`)"
                      class="card-prop-icon"
                    >
                  </td>
                  <td class="card-prop-value text-right pr-1">
                    {{ statFormatters[prop](brawler[prop]) }}
                  </td>
                  <td class="card-prop-label">
                    {{ statLabels[prop] }}
                  </td>
                </tr>
              </table>
            </template>
          </brawler-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BrawlerCard from '~/components/brawler-card'

export default {
  name: 'MetaPage',
  components: {
    BrawlerCard,
  },
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
      trophyChange: 'Total Week +/-',
    }
    const statIcons = {
      trophies: 'trophy_optimized',
      spTrophies: 'starpower_optimized',
      trophyChange: 'trophy_optimized', // TODO
    }
    const statFormatters = {
      trophies: n => Math.round(n),
      spTrophies: n => Math.round(n),
      trophyChange: n => n <= 0 ? Math.round(n) : `+${Math.round(n)}`,
    }

    return {
      comparator: 'trophies',
      order: +1,
      comparators,
      statLabels,
      statIcons,
      statFormatters,
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
