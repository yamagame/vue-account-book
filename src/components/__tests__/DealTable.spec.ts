import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import DealTable from '../DealTable.vue'

describe('DealTable', () => {
  it('renders properly', () => {
    const wrapper = mount(DealTable, {
      props: {
        fields: [
          {
            id: 0,
            date: '2000/01/01',
            month: '2000/01',
            kari: '資産',
            karivalue: '1000',
            kashi: '負債',
            kashivalue: '1000',
            name: '名目',
            last: false,
          },
        ],
        sumBGColor: '',
      },
    })
    expect(wrapper.text()).toContain('名目')
  })
})
