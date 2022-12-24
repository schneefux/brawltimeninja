import BCard from './b-card.vue'
import BButton from './b-button.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BCard> = {
  component: BCard,
  title: 'UI/Card',
}
export default meta

type Story = StoryObj<BCard>

const lipsum = `Brawl Stars has almost 200 distinct maps. With the daily Map Maker Competition Winner, there is a new map available to play every day. Unarguably, some maps must be better than others. How can we measure that?`

export const Default: Story = {
  render: (args) => ({
    components: { BCard },
    setup() {
      return { args }
    },
    template: `
      <b-card v-bind="args">
        <template v-slot:content>
          <p>${lipsum}</p>
        </template>
      </b-card>
    `,
  }),
  args: {
    title: 'Storybook Demo',
    elevation: 1,
    sm: true,
  },
}

export const Loading: Story = {
  render: (args) => ({
    components: { BCard },
    setup() {
      return { args }
    },
    template: `
      <b-card v-bind="args">
        <template v-slot:content>
          <p>${lipsum}</p>
        </template>
      </b-card>
    `,
  }),
  args: {
    title: 'Storybook Demo',
    elevation: 1,
    sm: true,
    loading: true,
  },
}

export const Infobar: Story = {
  render: (args) => ({
    components: { BCard },
    setup() {
      return { args }
    },
    template: `
      <b-card v-bind="args">
        <template v-slot:infobar>
        <p style="text-align: right;">Some meta information</p>
        </template>
        <template v-slot:content>
          <p>${lipsum}</p>
        </template>
      </b-card>
    `,
  }),
  args: {
    title: 'Storybook Demo',
    elevation: 1,
    sm: true,
  },
}

export const SubtitleAndIcon: Story = {
  render: (args) => ({
    components: { BCard },
    setup() {
      return { args }
    },
    template: `
      <b-card v-bind="args">
        <template v-slot:content>
          <p>${lipsum}</p>
        </template>
      </b-card>
    `,
  }),
  args: {
    title: 'Storybook Demo',
    subtitle: 'A Subtitle',
    icon: 'https://media.brawltime.ninja/modes/duo-showdown/icon.webp?size=120',
    elevation: 1,
    sm: true,
  },
}

export const Dense: Story = {
  render: (args) => ({
    components: { BCard },
    setup() {
      return { args }
    },
    template: `
      <b-card v-bind="args">
        <template v-slot:content>
          <p>A card with smaller padding</p>
        </template>
      </b-card>
    `,
  }),
  args: {
    title: 'Storybook Demo',
    elevation: 1,
    xxs: true,
    dense: true,
  },
}

const style = document.createElement('style')
style.innerHTML = '.bg-primary-demo { background-color: #BF8A28; }'
document.getElementsByTagName('head')[0].appendChild(style)

export const BackgroundColor: Story = {
  render: (args) => ({
    components: { BCard },
    setup() {
      return { args }
    },
    template: `
      <div>
        <b-card v-bind="args">
          <template v-slot:content>
            <p>${lipsum}</p>
          </template>
        </b-card>
      </div>
    `,
  }),
  args: {
    title: 'Storybook Demo',
    elevation: 1,
    md: true,
    color: 'bg-primary-demo',
  },
}

export const BackgroundImage: Story = {
  render: (args) => ({
    components: { BCard },
    setup() {
      return { args }
    },
    template: `
      <b-card v-bind="args">
        <template v-slot:content>
          <div>
            <p>A background image works well with nested dense cards, for example a roll.</p>
            <div style="display: flex; margin-top: 0.5rem;">
              <b-card
                v-for="i in 3"
                :elevation="2"
                :key="i"
                :title="'Inner ' + i"
                dense
              >
                <template v-slot:content>
                  <p>
                    Content {{ i }}
                  </p>
                </template>
              </b-card>
            </div>
          </div>
        </template>
      </b-card>
    `,
  }),
  args: {
    title: 'Storybook Demo',
    background: 'https://media.brawltime.ninja/modes/duo-showdown/background.webp?size=600',
    elevation: 1,
    sm: true,
  },
}

export const Actions: Story = {
  render: (args) => ({
    components: { BCard, BButton },
    setup() {
      return { args }
    },
    template: `
      <b-card v-bind="args">
        <template v-slot:content>
          <p>${lipsum}</p>
        </template>
        <template v-slot:actions>
          <div>
            <b-button primary sm>Open</b-button>
          </div>
        </template>
      </b-card>
    `,
  }),
  args: {
    title: 'Storybook Demo',
    elevation: 1,
    sm: true,
  },
}

export const Nested: Story = {
  render: (args) => ({
    components: { BCard },
    setup() {
      return { args }
    },
    template: `
      <b-card v-bind="args">
        <template v-slot:content>
          <div style="display: flex;">
            <b-card
              v-for="i in 3"
              :elevation="2"
              :key="i"
              :title="'Inner Card ' + i"
            >
              <template v-slot:content>
                <p>
                  Inner Content {{ i }}
                </p>
              </template>
            </b-card>
          </div>
        </template>
      </b-card>
    `,
  }),
  args: {
    title: 'Storybook Demo',
    elevation: 1,
    lg: true,
  },
}
