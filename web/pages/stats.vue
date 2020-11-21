<template>
  <div class="page container">
    <div class="section-heading">
      <h1 class="page-h1">Brawl Stars Stats</h1>
    </div>

    <div class="section-heading">
      <h2 class="page-h2">Most popular Game Modes</h2>
    </div>
    <div class="section">
      <mode-popularity-pie></mode-popularity-pie>
    </div>

    <div class="section-heading">
      <h2 class="page-h2">Hours played today</h2>
      <hours-spent-today></hours-spent-today>
    </div>


    <clan-search></clan-search>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
})
</script>
