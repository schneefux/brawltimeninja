import BKvTable from './b-kv-table.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BKvTable> = {
  component: BKvTable,
  title: 'UI/Key-Value Table',
}
export default meta

type Story = StoryObj<BKvTable>

export const Default: Story = {
  render: (args) => ({
    components: { BKvTable },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 16rem;">
        <b-kv-table v-bind="args">
        </b-kv-table>
      </div>
    `,
  }),
  args: {
    rows: [{
      title: 'Win Rate',
      key: 'stats.winRate',
    }, {
      title: 'Star Rate',
      key: 'stats.starRate',
    }, {
      title: 'Description',
      key: 'description',
    }],
    idKey: 'id',
    data: {
      id: 1,
      foobar: 123,
      stats: {
        winRate: '53.90%',
        starRate: '11.70%',
        blub: 'asdf',
      },
      description: 'This is a very long, overflowing text',
    },
  },
}

export const Slot: Story = {
  render: (args) => ({
    components: { BKvTable },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 10rem;">
        <b-kv-table v-bind="args">
          <template v-slot:myslot="{ row }">
            <b>"{{ row.stats.winRate }}"</b>
          </template>
        </b-kv-table>
      </div>
    `,
  }),
  args: {
    rows: [{
      title: 'Win Rate',
      key: 'stats.winRate',
      slot: 'myslot',
    }, {
      title: 'Star Rate',
      key: 'stats.starRate',
    }],
    idKey: 'id',
    data: {
      id: 1,
      foobar: 123,
      stats: {
        winRate: '53.90%',
        starRate: '11.70%',
        blub: 'asdf',
      },
    },
  },
}
