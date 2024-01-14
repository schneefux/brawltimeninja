<template>
  <b-lightbox v-model="lightboxOpen">
    <div class="w-full max-w-md">
      <b-card
        :loading="loading"
        :title="$t('feedback.title')"
      >
        <template v-slot:content>
          <form
            v-if="!success"
            class="grid grid-cols-[max-content,1fr] gap-x-8 gap-y-4 items-center"
            @submit.prevent="submit()"
          >
            <label v-bind-once="{ for: `${prefix}-name` }">
              {{ $t('feedback.name') }}
            </label>
            <b-textbox
              v-bind-once="{ id: `${prefix}-name` }"
              v-model="name"
              dark
            ></b-textbox>

            <label v-bind-once="{ for: `${prefix}-email` }">
              {{ $t('feedback.email') }}
            </label>
            <b-textbox
              v-bind-once="{ id: `${prefix}-email` }"
              v-model="email"
              dark
            ></b-textbox>

            <label v-bind-once="{ for: `${prefix}-comment` }">
              {{ $t('feedback.description') }}
            </label>
            <b-textarea
              v-bind-once="{ id: `${prefix}-comment` }"
              v-model="comment"
              dark
            ></b-textarea>

            <b-button
              :disabled="loading"
              type="submit"
              class="mt-2 ml-auto col-start-2"
              primary
              md
            >{{ $t('action.submit') }}</b-button>
          </form>
          <p
            v-else
            class="prose dark:prose-invert"
          >
            {{ $t('feedback.success') }}
          </p>
        </template>
      </b-card>
    </div>
  </b-lightbox>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { BTextbox, BButton, BTextarea, BLightbox, BCard } from '@schneefux/klicker/components'
import { useSentry } from '~/composables/compat'
import { BindOnce, generateId } from '@schneefux/klicker/directives'
import { useVModel } from '@vueuse/core'

export default defineComponent({
  components: {
    BLightbox,
    BTextarea,
    BTextbox,
    BButton,
    BCard,
  },
  directives: {
    BindOnce,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: {
    ['update:modelValue'](modelValue: boolean) { return true },
  },
  setup(props, { emit }) {
    const loading = ref(false)
    const name = ref('')
    const email = ref('')
    const comment = ref('')
    const success = ref(false)

    const sentry = useSentry()
    const submit = async () => {
      loading.value = true
      const eventId = sentry.lastEventId() ?? sentry.captureMessage("User Feedback");
      await (<any>sentry).captureUserFeedback({
        event_id: eventId,
        name: name.value,
        email: email.value,
        comments: comment.value,
      })
      loading.value = false
      success.value = true
    }

    const lightboxOpen = useVModel(props, 'modelValue', emit)

    const prefix = generateId()

    return {
      name,
      email,
      prefix,
      submit,
      comment,
      loading,
      success,
      lightboxOpen,
    }
  },
})
</script>
