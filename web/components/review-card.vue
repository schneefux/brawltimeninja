<template>
  <b-card
    :class="['relative', {
      'hidden': !reviewable || reviewDismissed,
    }]"
    :title="$t('banner.review.title')"
  >
    <template v-slot:content>
      <div>
        <button
          class="absolute top-0 right-0 mr-3 mt-2"
          @click="dismissReview"
        >
          <fa
            :icon="faTimes"
            class="inline"
          ></fa>
        </button>
        <p>
          {{ $t('banner.review.catchphrase') }}
        </p>
      </div>
    </template>

    <template v-slot:actions>
      <b-button
        class="mx-auto"
        md
        primary
        @click="clickReview"
      >
        <fa
          :icon="faGooglePlay"
          class="mr-1"
        ></fa>
        {{ $t('action.open') }}
      </b-button>
    </template>
  </b-card>
</template>

<script lang="ts">
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faGooglePlay } from '@fortawesome/free-brands-svg-icons'
import { defineComponent } from 'vue'
import { BCard, BButton, Fa } from '@schneefux/klicker/components'
import { useReview } from '~/composables/app'

export default defineComponent({
  components: {
    Fa,
    BButton,
    BCard,
  },
  setup() {
    const { reviewable, dismissReview, reviewDismissed, clickReview } = useReview()

    return {
      faTimes,
      faGooglePlay,
      dismissReview,
      clickReview,
      reviewable,
      reviewDismissed,
    }
  },
})
</script>
