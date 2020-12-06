<template>
  <page title="Brawl Stars Stats">
    <page-section
      title="Most popular Game Modes"
      tracking-id="modes"
      page-tracking-id="stats"
    >
      <mode-popularity-pie></mode-popularity-pie>
    </page-section>

    <page-section
      title="Hours played today"
      tracking-id="hours"
      page-tracking-id="stats"
    >
      <hours-spent-today></hours-spent-today>
    </page-section>

    <clan-search></clan-search>
  </page>
</template>
