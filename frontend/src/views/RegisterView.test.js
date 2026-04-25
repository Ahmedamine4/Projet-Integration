import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterView from './RegisterView.vue'


vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    register: vi.fn()
  })
}))
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('RegisterView', () => {

  it('shows error when first name contains numbers', async () => {

  const wrapper = mount(RegisterView, {
    global: {
      stubs: {
        BaseInput: {
          template: '<input />'
        }
      }
    }
  })

  const inputs = wrapper.findAll('input')

  await inputs[0].setValue('Ahmed123')
  await inputs[1].setValue('Test')     
  await inputs[2].setValue('test@mail.com') 
  await inputs[3].setValue('password123') 

  const button = wrapper.find('button')

  expect(button.element.disabled).toBe(false)

  await button.trigger('click')

  expect(wrapper.find('.error').exists()).toBe(true)

})
})