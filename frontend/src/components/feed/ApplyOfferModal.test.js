import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ApplyOfferModal from './ApplyOfferModal.vue';

const FeedModalShellStub = defineComponent({
  name: 'FeedModalShell',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'md',
    },
  },
  emits: ['close'],
  template: `
    <div
      v-if="open"
      data-test="feed-modal-shell"
      :data-size="size"
    >
      <h2 data-test="modal-title">{{ title }}</h2>
      <p data-test="modal-description">{{ description }}</p>

      <button
        type="button"
        data-test="shell-close"
        @click="$emit('close')"
      >
        Close
      </button>

      <div data-test="modal-content">
        <slot />
      </div>

      <footer data-test="modal-footer">
        <slot name="footer" />
      </footer>
    </div>
  `,
});

const BaseErrorStub = defineComponent({
  name: 'BaseError',
  props: {
    variant: {
      type: String,
      default: 'global',
    },
  },
  template: `
    <p
      data-test="base-error"
      :data-variant="variant"
    >
      <slot />
    </p>
  `,
});

const offer = {
  id: 'offer-1',
  title: 'Frontend Developer Internship',
  company: 'Owltsy',
  location: 'Casablanca',
};

function mountModal(props = {}) {
  return mount(ApplyOfferModal, {
    props: {
      offer,
      loading: false,
      ...props,
    },
    global: {
      stubs: {
        FeedModalShell: FeedModalShellStub,
        BaseError: BaseErrorStub,
      },
    },
  });
}

function getSubmitButton(wrapper) {
  return wrapper
    .findAll('.feed-modal-button')
    .find((button) => button.text() === 'Send application');
}

function getCancelButton(wrapper) {
  return wrapper
    .findAll('.feed-modal-button')
    .find((button) => button.text() === 'Cancel');
}

describe('ApplyOfferModal', () => {
  it('does not render the modal when offer is null', () => {
    const wrapper = mountModal({
      offer: null,
    });

    expect(wrapper.find('[data-test="feed-modal-shell"]').exists()).toBe(false);
  });

  it('renders the modal title and description when offer exists', () => {
    const wrapper = mountModal();

    expect(wrapper.find('[data-test="feed-modal-shell"]').exists()).toBe(true);

    expect(wrapper.find('[data-test="modal-title"]').text()).toBe(
      'Apply to Frontend Developer Internship'
    );

    expect(wrapper.find('[data-test="modal-description"]').text()).toBe(
      'Owltsy - Casablanca'
    );

    expect(wrapper.text()).toContain('Application message');
    expect(wrapper.text()).toContain(
      'This message will be prepared for the recruiter reviewing this offer.'
    );
  });

  it('renders only company in description when location is missing', () => {
    const wrapper = mountModal({
      offer: {
        ...offer,
        location: '',
      },
    });

    expect(wrapper.find('[data-test="modal-description"]').text()).toBe('Owltsy');
  });

  it('disables submit when the message is empty', () => {
    const wrapper = mountModal();

    const submitButton = getSubmitButton(wrapper);

    expect(submitButton.exists()).toBe(true);
    expect(submitButton.element.disabled).toBe(true);
  });

  it('disables textarea and buttons when loading is true', () => {
    const wrapper = mountModal({
      loading: true,
    });

    expect(wrapper.find('textarea').element.disabled).toBe(true);
    expect(getSubmitButton(wrapper).element.disabled).toBe(true);
    expect(getCancelButton(wrapper).element.disabled).toBe(true);
  });

  it('emits close when FeedModalShell emits close', async () => {
    const wrapper = mountModal();

    await wrapper.find('[data-test="shell-close"]').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when clicking Cancel', async () => {
    const wrapper = mountModal();

    await getCancelButton(wrapper).trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('shows an error when the message has less than 20 characters', async () => {
    const wrapper = mountModal();

    await wrapper.find('textarea').setValue('Too short');
    await getSubmitButton(wrapper).trigger('click');

    expect(wrapper.find('[data-test="base-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="base-error"]').text()).toBe(
      'Application message must be at least 20 characters.'
    );

    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('clears the error when the user types again', async () => {
    const wrapper = mountModal();

    await wrapper.find('textarea').setValue('Too short');
    await getSubmitButton(wrapper).trigger('click');

    expect(wrapper.find('[data-test="base-error"]').exists()).toBe(true);

    await wrapper.find('textarea').setValue('This is now a longer message.');
    await nextTick();

    expect(wrapper.find('[data-test="base-error"]').exists()).toBe(false);
  });

  it('emits submit with trimmed message when the message is valid', async () => {
    const wrapper = mountModal();

    await wrapper
      .find('textarea')
      .setValue('   I am very interested in this opportunity.   ');

    await getSubmitButton(wrapper).trigger('click');

    expect(wrapper.emitted('submit')).toBeTruthy();

    expect(wrapper.emitted('submit')[0]).toEqual([
      {
        offerId: 'offer-1',
        offerTitle: 'Frontend Developer Internship',
        company: 'Owltsy',
        message: 'I am very interested in this opportunity.',
      },
    ]);
  });

  it('keeps the message after submit until the modal closes', async () => {
    const wrapper = mountModal();

    await wrapper
      .find('textarea')
      .setValue('I am very interested in this opportunity.');

    await getSubmitButton(wrapper).trigger('click');
    await nextTick();

    expect(wrapper.find('textarea').element.value).toBe(
      'I am very interested in this opportunity.'
    );
    expect(wrapper.find('[data-test="base-error"]').exists()).toBe(false);

    await wrapper.setProps({
      offer: null,
    });

    await wrapper.setProps({
      offer,
    });
    await nextTick();

    expect(wrapper.find('textarea').element.value).toBe('');
    expect(wrapper.find('[data-test="base-error"]').exists()).toBe(false);
  });

  it('renders an API error passed by the parent', () => {
    const wrapper = mountModal({
      errorMessage: 'Already applied',
    });

    expect(wrapper.find('[data-test="base-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="base-error"]').text()).toBe('Already applied');
  });

  it('resets message and error when offer becomes null', async () => {
    const wrapper = mountModal();

    await wrapper.find('textarea').setValue('Too short');
    await getSubmitButton(wrapper).trigger('click');

    expect(wrapper.find('[data-test="base-error"]').exists()).toBe(true);

    await wrapper.setProps({
      offer: null,
    });

    await wrapper.setProps({
      offer,
    });

    await nextTick();

    expect(wrapper.find('textarea').element.value).toBe('');
    expect(wrapper.find('[data-test="base-error"]').exists()).toBe(false);
  });
});
