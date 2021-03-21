import { mount } from '@vue/test-utils'
import MapBestStarpowersCard from './map-best-starpowers-roll.vue'

describe('MapBestStarpowerCard.vue', () => {
  test('should render', async () => {
    const wrapper = mount(MapBestStarpowersCard, {
      propsData: {
      },
    })

    const shimmer = await wrapper.find('.shimmer')
    expect(shimmer.exists()).toBe(true)
    // TODO
  })
})
