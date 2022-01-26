import BCard from './b-card.vue'
import BButton from './b-button.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BCard,
  title: 'Card',
} as Meta

const lipsum = `Brawl Stars has almost 200 distinct maps. With the daily Map Maker Competition Winner, there is a new map available to play every day. Unarguably, some maps must be better than others. How can we measure that?`

export const Default: Story = (args, { argTypes }) => ({
  components: { BCard },
  props: Object.keys(argTypes),
  template: `
    <b-card v-bind="$props">
      <p slot="content">${lipsum}</p>
    </b-card>
  `,
})
Default.args = {
  title: 'Storybook Demo',
  elevation: 1,
  sm: true,
}

export const Loading: Story = (args, { argTypes }) => ({
  components: { BCard },
  props: Object.keys(argTypes),
  template: `
    <b-card v-bind="$props">
      <p slot="content">${lipsum}</p>
    </b-card>
  `,
})
Loading.args = {
  title: 'Storybook Demo',
  elevation: 1,
  sm: true,
  loading: true,
}

export const Light: Story = (args, { argTypes }) => ({
  components: { BCard },
  props: Object.keys(argTypes),
  template: `
    <b-card v-bind="$props">
      <p slot="content">${lipsum}</p>
    </b-card>
  `,
})
Light.args = {
  title: 'Storybook Demo',
  elevation: 1,
  sm: true,
  light: true,
}

export const Infobar: Story = (args, { argTypes }) => ({
  components: { BCard },
  props: Object.keys(argTypes),
  template: `
    <b-card v-bind="$props">
      <p slot="infobar" style="text-align: right;">Some meta information</p>
      <p slot="content">${lipsum}</p>
    </b-card>
  `,
})
Infobar.args = {
  title: 'Storybook Demo',
  elevation: 1,
  sm: true,
}

export const SubtitleAndIcon: Story = (args, { argTypes }) => ({
  components: { BCard },
  props: Object.keys(argTypes),
  template: `
    <b-card v-bind="$props">
      <p slot="content">${lipsum}</p>
    </b-card>
  `,
})
SubtitleAndIcon.args = {
  title: 'Storybook Demo',
  subtitle: 'A Subtitle',
  icon: 'https://media.brawltime.ninja/modes/duo-showdown/icon.webp?size=120',
  elevation: 1,
  sm: true,
}

export const Dense: Story = (args, { argTypes }) => ({
  components: { BCard },
  props: Object.keys(argTypes),
  template: `
    <b-card v-bind="$props">
      <p slot="content">A card with smaller padding</p>
    </b-card>
  `,
})
Dense.args = {
  title: 'Storybook Demo',
  elevation: 1,
  xxs: true,
  dense: true,
}

const style = document.createElement('style')
style.innerHTML = '.bg-yellow-400 { background-color: #BF8A28; }'
document.getElementsByTagName('head')[0].appendChild(style)

export const BackgroundColor: Story = (args, { argTypes }) => ({
  components: { BCard },
  props: Object.keys(argTypes),
  template: `
    <div>
      <b-card v-bind="$props">
        <p slot="content">${lipsum}</p>
      </b-card>
    </div>
  `,
})
BackgroundColor.args = {
  title: 'Storybook Demo',
  elevation: 1,
  md: true,
  color: 'bg-yellow-400',
}

export const BackgroundImage: Story = (args, { argTypes }) => ({
  components: { BCard },
  props: Object.keys(argTypes),
  template: `
    <b-card v-bind="$props">
      <div slot="content">
        <p>A background image works well with nested dense cards, for example a roll.</p>
        <div style="display: flex; margin-top: 0.5rem;">
          <b-card
            v-for="i in 3"
            :elevation="2"
            :key="i"
            :title="'Inner ' + i"
            dense
          >
            <p slot="content">
              Content {{ i }}
            </p>
          </b-card>
        </div>
      </div>
    </b-card>
  `,
})
BackgroundImage.args = {
  title: 'Storybook Demo',
  background: 'https://media.brawltime.ninja/modes/duo-showdown/background.webp?size=600',
  elevation: 1,
  sm: true,
}

export const Actions: Story = (args, { argTypes }) => ({
  components: { BCard, BButton },
  props: Object.keys(argTypes),
  template: `
    <b-card v-bind="$props">
      <p slot="content">${lipsum}</p>
      <div slot="actions">
        <b-button primary sm>Open</b-button>
      </div>
    </b-card>
  `,
})
Actions.args = {
  title: 'Storybook Demo',
  elevation: 1,
  sm: true,
}

export const Nested: Story = (args, { argTypes }) => ({
  components: { BCard },
  props: Object.keys(argTypes),
  template: `
    <b-card v-bind="$props">
      <div slot="content" style="display: flex;">
        <b-card
          v-for="i in 3"
          :elevation="2"
          :key="i"
          :title="'Inner Card ' + i"
        >
          <p slot="content">
            Inner Content {{ i }}
          </p>
        </b-card>
      </div>
    </b-card>
  `,
})
Nested.args = {
  title: 'Storybook Demo',
  elevation: 1,
  lg: true,
}
