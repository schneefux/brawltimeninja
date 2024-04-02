<template>
  <!-- Stickies and instream -->
  <venatus-placement
    ad-id="65f9504e767223575b4de5b7"
    ad-type="rich-media"
  ></venatus-placement>
</template>

<style lang="postcss">
/* push footer above bottom nav */
.vm-footer {
  @apply max-md:bottom-14 !important; /* 3.5rem (14) for footer */
}

/* push instream video player above bottom nav */
avp-player-ui {
  /* push video player above footers */
  /* 3.5rem (14) for footer + 50px for mobile footer ad + 0.5rem padding */
  --avb-offset-bottom: 115px !important;

  --avb-offset-right: 8px !important;
}
</style>
