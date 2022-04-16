<template>
  <div>
    <input
      v-model="dateFilter"
      type="date"
      class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none bg-contrast/5 ring-2 focus:ring-2 ring-contrast/10 hover:ring-contrast/20"
    >
    <b-button
      v-show="dateFilter != undefined"
      class="ml-2"
      primary
      round
      xs
      @click="dateFilter = undefined"
    >
      <font-awesome-icon
        :icon="faTimes"
      ></font-awesome-icon>
    </b-button>

    <b-scrolling-list
      :items="datesShown"
      :cell-rows="3"
      :cell-columns="2"
      :render-at-least="5"
      key-id="date"
      render-placeholder
    >
      <template v-slot:item="date">
        <b-card :title="date.date">
          <media-img
            slot="content"
            :path="`/maps/competition-winners/${date.date}`"
            :alt="date"
            size="512"
          ></media-img>
        </b-card>
      </template>
    </b-scrolling-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api'
import { BScrollingList, BTextbox } from '@schneefux/klicker/components'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  components: {
    BScrollingList,
    BTextbox,
  },
  setup() {
    const dateFilter = ref<string>(new Date().toISOString().slice(0, 10))

    const datesShown = computed(() => {
      const dates: {
        date: string,
      }[] = []

      const start = new Date(dateFilter.value) ?? new Date()
      const end = new Date(start.valueOf())
      end.setDate(end.getDate() - 3*31)

      for (let date = start; date > end; date.setDate(date.getDate() - 1)) {
        dates.push({
          date: date.toISOString().slice(0, 10),
        })
      }

      return dates
    })

    return {
      dateFilter,
      datesShown,
      faTimes,
    }
  },
})
</script>
