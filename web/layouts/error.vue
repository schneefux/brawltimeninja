<template>
  <div class="container text-center mx-auto py-4 px-2">
    <h1 class="text-3xl">
      {{ $t('error.oops') }}
    </h1>
    <h2 class="text-2xl">
      {{ error.message }}
    </h2>
    <h3
      v-if="error.statusCode == 429 || error.statusCode >= 500"
      class="text-2xl mt-2"
    >
      {{ $t('error.misc') }}
    </h3>
    <p class="mt-4">
      <b-button
        :to="localePath('/')"
        primary
        md
      >
        {{ $t('action.home') }}
      </b-button>
    </p>
  </div>
</template>

<script>
export default {
  layout: 'default',
  props: ['error'],
}
</script>
