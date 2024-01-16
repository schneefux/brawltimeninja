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
              v-if="!success"
              class="flex flex-col gap-y-2"
            >
              <label
                v-bind-once="{ for: `${prefix}-name` }"
                class="mt-3"
              >
                {{ $t('feedback.name') }}
              </label>
              <b-textbox
                v-bind-once="{ id: `${prefix}-name` }"
                v-model="name"
                autocomplete="given-name"
                dark
              ></b-textbox>

              <label
                v-bind-once="{ for: `${prefix}-email` }"
                class="mt-3"
              >
                {{ $t('feedback.email') }}
              </label>
              <b-textbox
                v-bind-once="{ id: `${prefix}-email` }"
                v-model="email"
                type="email"
                dark
              ></b-textbox>

              <label
                v-bind-once="{ for: `${prefix}-comment` }"
                class="mt-3"
              >
                {{ $t('feedback.description') }}
              </label>
              <b-textarea
                v-bind-once="{ id: `${prefix}-comment` }"
                v-model="comment"
                rows="4"
                required
                dark
              ></b-textarea>
            </div>
            <p
              v-else
              class="prose dark:prose-invert"
            >
              {{ $t('feedback.success') }}
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
                v-if="!success"
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
      await (<any> sentry).sendFeedback({
        name: name.value,
        email: email.value,
        comments: comment.value,
      }, { includeReplay: true })
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
