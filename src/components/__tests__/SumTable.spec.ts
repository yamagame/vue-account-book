import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import SumTable from '../SumTable.vue'

describe('SumTable', () => {
  it('renders properly', () => {
    const wrapper = mount(SumTable, {
      props: {
        monthly: [
          {
            id: 0,
            date: '2000/01',
            kari: 1000,
            kashi: 1000,
            last: false,
          },
        ],
        sumBGColor: '',
      },
    })
    expect(wrapper.text()).toContain('2000/01')
  })
})
