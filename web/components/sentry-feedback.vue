<template>
  <b-lightbox v-model="lightboxOpen">
    <div class="w-full max-w-md">
      <form @submit.prevent="submit()">
        <b-card
          :loading="loading"
          :title="$t('feedback.title')"
          :elevation="0"
        >
          <template v-slot:content>
            <div
              v-if="result == undefined"
              class="flex flex-col gap-y-2"
            >
              <label
                :for="`${prefix}-name`"
                class="mt-3"
              >
                {{ $t('feedback.name') }}
              </label>
              <b-textbox
                v-model="name"
                :id="`${prefix}-name`"
                autocomplete="given-name"
                dark
              ></b-textbox>

              <label
                :for="`${prefix}-email`"
                class="mt-3"
              >
                {{ $t('feedback.email') }}
              </label>
              <b-textbox
                v-model="email"
                :id="`${prefix}-email`"
                type="email"
                dark
              ></b-textbox>

              <label
                :for="`${prefix}-comment`"
                class="mt-3"
              >
                {{ $t('feedback.description') }}
              </label>
              <b-textarea
                v-model="comment"
                :id="`${prefix}-comment`"
                rows="4"
                required
                dark
              ></b-textarea>
            </div>
            <p
              v-else
              class="prose dark:prose-invert"
            >
              {{ result == 'success' ? $t('feedback.success') : $t('feedback.error') }}
            </p>
          </template>
          <template v-slot:actions>
            <div class="space-x-2">
              <b-button
                dark
                md
                @click="lightboxOpen = false"
              >{{ $t('action.close') }}</b-button>
              <b-button
                v-if="result == undefined"
                :disabled="loading || comment.length == 0"
                type="submit"
                primary
                md
              >{{ $t('action.submit') }}</b-button>
            </div>
          </template>
        </b-card>
      </form>
    </div>
  </b-lightbox>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, useId } from 'vue'
import { BTextbox, BButton, BTextarea, BLightbox, BCard } from '@schneefux/klicker/components'
import { useSentry } from '~/composables/compat'
import { useVModel } from '@vueuse/core'
import type Feedback from '@sentry-internal/feedback'

export default defineComponent({
  components: {
    BLightbox,
    BTextarea,
    BTextbox,
    BButton,
    BCard,
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
    const result = ref<'success'|'error'>()

    const sentry = useSentry()

    let FeedbackIntegration: typeof Feedback

    onMounted(async () => {
      FeedbackIntegration = await import('@sentry-internal/feedback')
    })

    const submit = async () => {
      loading.value = true
      result.value = undefined
      if (FeedbackIntegration == undefined) {
        result.value = 'error'
      } else {
        try {
          await FeedbackIntegration.sendFeedback({
            name: name.value,
            email: email.value,
            message: comment.value,
          }, { includeReplay: true })
          result.value = 'success'
        } catch (err) {
          sentry.captureException(err)
          console.error(err)
          result.value = 'error'
        }
      }
      loading.value = false
    }

    const lightboxOpen = useVModel(props, 'modelValue', emit)

    const prefix = useId()

    return {
      name,
      email,
      prefix,
      submit,
      result,
      comment,
      loading,
      lightboxOpen,
    }
  },
})
</script>
