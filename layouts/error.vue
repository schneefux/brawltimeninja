<template>
  <div class="container text-center mx-auto py-4 px-2">
    <img class="h-32 mt-6" src="/images/hero/model/spike_loss_optimized.png">
    <h1>Oops!</h1>
    <h2>{{ error.message }}.</h2>
    <p class="mt-4">
      <nuxt-link
        to="/"
        class="no-underline text-secondary border-primary border-b-2"
      >Return to home</nuxt-link>
    </p>
  </div>
</template>

<script>
export default {
  layout: 'default',
  props: ['error'],
}
</script>
