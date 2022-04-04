module.exports = {
  preRender(page, story) {
    if (story.name.includes('Mobile')) {
      // https://github.com/storybookjs/storybook/blob/master/addons/viewport/src/defaults.ts#L176
      page.setViewportSize({ width: 896, height: 414 })
    }
  },
}