<template>
  <div class="dashboard dashboard--responsive dashboard--responsive-stretch">
    <c-dashboard-cell
      v-for="index in limit"
      :key="index"
      :rows="1"
      :columns="3"
    >
      <b-card
        v-if="articles != undefined && articles[index - 1] != undefined"
        :title="articles[index - 1].title"
        :link="`/blog/${topic}/${articles[index - 1].slug}`"
        :icon="articles[index - 1].mode != undefined ? `/modes/${articles[index - 1].modeKebab}/icon` : undefined"
        :icon-alt="articles[index - 1].mode != undefined ? $t('mode.' + articles[index - 1].mode) : undefined"
      >
        <template
          v-if="articles[index - 1].mode != undefined"
          v-slot:icon="data"
        >
          <media-img-icon v-bind="data"></media-img-icon>
        </template>

        <p slot="content">
          {{ articles[index - 1].description }}
        </p>

        <b-button
          slot="actions"
          :to="`/blog/${topic}/${articles[index - 1].slug}`"
          primary
          sm
        >{{ $t('action.read') }}</b-button>
      </b-card>
    </c-dashboard-cell>
  </div>
</template>

<script lang="ts">
import { defineComponent, useAsync, useContext } from '@nuxtjs/composition-api'
import { BCard, CDashboardCell, BButton, } from '@schneefux/klicker/components'
import { camelToKebab } from '~/lib/util'

interface Article {
  id: string
  title: string
  slug: string
  mode: string
  description: string
}

export default defineComponent({
  components: {
    BCard,
    BButton,
    CDashboardCell,
  },
  props: {
    topic: {
      type: String,
      required: true
    },
    limit: {
      type: Number,
      default: 3
    },
  },
  setup(props) {
    const { $content } = useContext()
    const articles = useAsync<Article[]>(async () => {
      const articles = await $content(props.topic)
        .sortBy('createdAt', 'desc')
        .limit(props.limit)
        .fetch()
      return articles
        .map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          mode: a.mode,
          modeKebab: a.mode != undefined ? camelToKebab(a.mode) : undefined,
          description: a.description,
        }))
    }, `blogroll-${props.topic}-${props.limit}`)

    return {
      articles,
    }
  },
})
</script>
