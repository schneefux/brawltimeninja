<template>
  <!-- Stickies and instream -->
  <venatus-placement
    ad-id="65f9504e767223575b4de5b7"
    ad-type="rich-media"
  ></venatus-placement>
</template>

<style lang="postcss">
/* leave space for sticky footer */
main {
  @apply max-md:pb-[100px] !important; /* sticky footer height */
}

/* push footer above bottom nav */
.vm-footer {
  @apply max-md:bottom-14 !important; /* 3.5rem (14) for footer */
}

/* push instream video player above bottom nav and sticky ad */
avp-player-ui {
  /* 3.5rem (14) for footer + 50px for mobile footer ad + 0.75rem padding */
  --avp-offset-bottom: 120px !important;

  --avp-offset-right: 8px !important;
}
</style>
