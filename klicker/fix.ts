export const getCanvasElementFixed = (canvasElement: HTMLElement) => {
  return canvasElement
  /*
  // Vue 2 renderer has race conditions
  // due to some knob hacks, it renders an empty div in unit tests
  // https://github.com/storybookjs/storybook/blob/next/app/vue/src/client/preview/render.ts#L19
  return canvasElement.ownerDocument.getElementById('root')
  */
}
