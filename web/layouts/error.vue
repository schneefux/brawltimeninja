<template>
  <div
    ref="container"
    class="min-h-screen bg-background text-text"
  >
    <nav class="light bg-primary-400 text-text p-6 flex justify-between items-center flex-wrap gap-y-3 z-40 sticky top-0 lg:static">
      <a
        href="/"
        class="font-semibold text-xl tracking-tight leading-tight"
      >Brawl Time Ninja</a>
    </nav>

    <div class="fill-height">
      <slot></slot>
    </div>

    <footer></footer>
  </div>
</template>

<style>
/* do not use scoped to suppress Vue warning about non-prop attributes */

/* main content size = 100vh - header - footer */

:root {
  --mobile-layout-height: calc(100vh - 56px - 56px);
  --desktop-layout-height: calc(100vh - 76px - 160px);
}
</style>
