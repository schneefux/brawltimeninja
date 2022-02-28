import BKvTable from './b-kv-table.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BKvTable,
  title: 'UI/Key-Value Table',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BKvTable },
  props: Object.keys(argTypes),
  template: `
    <div style="width: 10rem;">
      <b-kv-table v-bind="$props">
      </b-kv-table>
    </div>
  `,
})
Default.args = {
  rows: [{
    title: 'Win Rate',
    key: 'stats.winRate',
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
}

export const Slot: Story = (args, { argTypes }) => ({
  components: { BKvTable },
  props: Object.keys(argTypes),
  template: `
    <div style="width: 10rem;">
      <b-kv-table v-bind="$props">
        <template v-slot:myslot="{ row }">
          <b>"{{ row.stats.winRate }}"</b>
        </template>
      </b-kv-table>
    </div>
  `,
})
Slot.args = {
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
}
