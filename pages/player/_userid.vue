<template>
  <div class="container mx-auto p-4">
    <div class="font-sans">
      <h1>Statistics for {{ player.name }}</h1>
    </div>
  </div>
</template>

<script>
export default {
  asyncData({ params }) {
    return {
      player: {
        name: params.userid,
        victoriesByMode: {
          '3v3': 1234,
          'solo showdown': 12,
          'duo showdown': 34
        }
      }
    }
  }
}
</script>
