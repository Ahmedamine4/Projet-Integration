import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import SchoolPathModal from './SchoolPathModal.vue';

vi.mock('@/composables/useBodyScrollLock', () => ({
  useBodyScrollLock: vi.fn(),
}));

const ProgressMeterStub = defineComponent({
  name: 'ProgressMeter',
  props: {
    value: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 0,
    },
  },
  template: `
    <div
      data-test="progress-meter"
      :data-value="value"
      :data-max="max"
    />
  `,
});

const BaseDropdownStub = defineComponent({
  name: 'BaseDropdown',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  template: `
    <input
      data-test="base-dropdown"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  `,
});

const YearInputStub = defineComponent({
  name: 'YearInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    min: {
      type: Number,
      default: 1980,
    },
    max: {
      type: Number,
      default: new Date().getFullYear(),
    },
  },
  emits: ['update:modelValue'],
  template: `
    <label>
      <span>{{ label }}</span>
      <input
        data-test="year-input"
        :data-label="label"
        :data-min="min"
        :data-max="max"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      >
    </label>
  `,
});

const BaseButtonStub = defineComponent({
  name: 'BaseButton',
  props: {
    variant: {
      type: String,
      default: 'submit',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  template: `
    <button
      data-test="base-button"
      :data-variant="variant"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <slot />
    </button>
  `,
});

const CloseButtonStub = defineComponent({
  name: 'CloseButton',
  emits: ['click'],
  template: `
    <button
      type="button"
      data-test="close-button"
      @click="$emit('click')"
    >
      Close
    </button>
  `,
});

const schools = [
  {
    nom: 'ENSIAS',
    institution_id: 'school-ensias',
  },
  {
    nom: 'EMSI',
    institution_id: 'school-emsi',
  },
  {
    nom: 'INPT',
    institution_id: 'school-inpt',
  },
];

function mountModal(props = {}) {
  return mount(SchoolPathModal, {
    props: {
      open: true,
      schools,
      ...props,
    },
    global: {
      stubs: {
        ProgressMeter: ProgressMeterStub,
        BaseDropdown: BaseDropdownStub,
        YearInput: YearInputStub,
        BaseButton: BaseButtonStub,
        CloseButton: CloseButtonStub,
        Transition: true,
      },
    },
  });
}

async function clickNext(wrapper) {
  await wrapper.find('.next-button').trigger('click');
  await nextTick();
}

async function clickBack(wrapper) {
  await wrapper.find('.back-button').trigger('click');
  await nextTick();
}

async function selectStudyStatus(wrapper, text) {
  const option = wrapper
    .findAll('.option')
    .find((button) => button.text().includes(text));

  await option.trigger('click');
  await nextTick();
}

async function selectAcademicLevel(wrapper, text) {
  const option = wrapper
    .findAll('.option')
    .find((button) => button.text().includes(text));

  await option.trigger('click');
  await nextTick();
}

async function fillCurrentSchool(wrapper, {
  schoolName = 'ENSIAS',
  startYear = '2020',
  endYear = '2023',
} = {}) {
  await wrapper.find('[data-test="base-dropdown"]').setValue(schoolName);

  const yearInputs = wrapper.findAll('[data-test="year-input"]');

  await yearInputs[0].setValue(startYear);

  if (endYear !== null && yearInputs[1]) {
    await yearInputs[1].setValue(endYear);
  }

  await nextTick();
}

describe('SchoolPathModal', () => {
  it('does not render when open is false', () => {
    const wrapper = mountModal({
      open: false,
    });

    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('renders the first step when open is true', () => {
    const wrapper = mountModal();

    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.text()).toContain('Build your academic path');
    expect(wrapper.text()).toContain('Study status');
    expect(wrapper.text()).toContain('I am currently studying');
    expect(wrapper.text()).toContain('I am not currently studying');

    expect(wrapper.find('.next-button').element.disabled).toBe(true);
    expect(wrapper.find('[data-test="progress-meter"]').attributes('data-value')).toBe('0');
    expect(wrapper.find('[data-test="progress-meter"]').attributes('data-max')).toBe('2');
  });

  it('enables Next after choosing the study status', async () => {
    const wrapper = mountModal();

    expect(wrapper.find('.next-button').element.disabled).toBe(true);

    await selectStudyStatus(wrapper, 'I am currently studying');

    expect(wrapper.find('.next-button').element.disabled).toBe(false);
  });

  it('moves from study status step to academic level step', async () => {
    const wrapper = mountModal();

    await selectStudyStatus(wrapper, 'I am currently studying');
    await clickNext(wrapper);

    expect(wrapper.text()).toContain('Academic level');
    expect(wrapper.text()).toContain('Bachelor / Licence');
    expect(wrapper.text()).toContain('Master');
    expect(wrapper.text()).toContain('PhD');

    expect(wrapper.find('.next-button').element.disabled).toBe(true);
    expect(wrapper.find('[data-test="progress-meter"]').attributes('data-value')).toBe('1');
  });

  it('moves to the bachelor school step after selecting bachelor level', async () => {
    const wrapper = mountModal();

    await selectStudyStatus(wrapper, 'I am currently studying');
    await clickNext(wrapper);

    await selectAcademicLevel(wrapper, 'Bachelor / Licence');
    await clickNext(wrapper);

    expect(wrapper.text()).toContain('Bachelor / Licence school');
    expect(wrapper.find('[data-test="base-dropdown"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-test="year-input"]')).toHaveLength(1);
    expect(wrapper.text()).toContain('Start year');
    expect(wrapper.text()).not.toContain('Completion year');

    expect(wrapper.find('.next-button').element.disabled).toBe(true);
  });

  it('completes a current bachelor academic path', async () => {
    const wrapper = mountModal();

    await selectStudyStatus(wrapper, 'I am currently studying');
    await clickNext(wrapper);

    await selectAcademicLevel(wrapper, 'Bachelor / Licence');
    await clickNext(wrapper);

    await fillCurrentSchool(wrapper, {
      schoolName: 'ENSIAS',
      startYear: '2021',
      endYear: null,
    });

    expect(wrapper.find('.next-button').element.disabled).toBe(false);
    expect(wrapper.find('.next-button').text()).toBe('Complete');

    await clickNext(wrapper);

    expect(wrapper.emitted('complete')).toBeTruthy();

    const payload = wrapper.emitted('complete')[0][0];

    expect(payload.isCurrentlyStudying).toBe(true);
    expect(payload.academicLevel).toBe('bachelor');

    expect(payload.schoolPath.bachelorSchool).toEqual({
      institutionId: 'school-ensias',
      startYear: '2021',
      endYear: null,
      isCurrent: true,
    });
  });

  it('requires an end year when the user is not currently studying', async () => {
    const wrapper = mountModal();

    await selectStudyStatus(wrapper, 'I am not currently studying');
    await clickNext(wrapper);

    await selectAcademicLevel(wrapper, 'Bachelor / Licence');
    await clickNext(wrapper);

    expect(wrapper.findAll('[data-test="year-input"]')).toHaveLength(2);
    expect(wrapper.text()).toContain('Completion year');

    await fillCurrentSchool(wrapper, {
      schoolName: 'ENSIAS',
      startYear: '2020',
      endYear: null,
    });

    expect(wrapper.find('.next-button').element.disabled).toBe(true);

    const yearInputs = wrapper.findAll('[data-test="year-input"]');
    await yearInputs[1].setValue('2023');
    await nextTick();

    expect(wrapper.find('.next-button').element.disabled).toBe(false);
  });

  it('does not allow completion when end year is before start year', async () => {
    const wrapper = mountModal();

    await selectStudyStatus(wrapper, 'I am not currently studying');
    await clickNext(wrapper);

    await selectAcademicLevel(wrapper, 'Bachelor / Licence');
    await clickNext(wrapper);

    await fillCurrentSchool(wrapper, {
      schoolName: 'ENSIAS',
      startYear: '2022',
      endYear: '2020',
    });

    expect(wrapper.find('.next-button').element.disabled).toBe(true);
  });

  it('completes a finished bachelor academic path', async () => {
    const wrapper = mountModal();

    await selectStudyStatus(wrapper, 'I am not currently studying');
    await clickNext(wrapper);

    await selectAcademicLevel(wrapper, 'Bachelor / Licence');
    await clickNext(wrapper);

    await fillCurrentSchool(wrapper, {
      schoolName: 'ENSIAS',
      startYear: '2020',
      endYear: '2023',
    });

    await clickNext(wrapper);

    expect(wrapper.emitted('complete')).toBeTruthy();

    const payload = wrapper.emitted('complete')[0][0];

    expect(payload.isCurrentlyStudying).toBe(false);
    expect(payload.academicLevel).toBe('bachelor');

    expect(payload.schoolPath.bachelorSchool).toEqual({
      institutionId: 'school-ensias',
      startYear: '2020',
      endYear: '2023',
      isCurrent: false,
    });
  });

  it('moves through bachelor and master fields for a master path', async () => {
    const wrapper = mountModal();

    await selectStudyStatus(wrapper, 'I am not currently studying');
    await clickNext(wrapper);

    await selectAcademicLevel(wrapper, 'Master');
    await clickNext(wrapper);

    expect(wrapper.text()).toContain('Bachelor / Licence school');

    await fillCurrentSchool(wrapper, {
      schoolName: 'ENSIAS',
      startYear: '2018',
      endYear: '2021',
    });

    await clickNext(wrapper);

    expect(wrapper.text()).toContain('Master school');

    await fillCurrentSchool(wrapper, {
      schoolName: 'EMSI',
      startYear: '2021',
      endYear: '2023',
    });

    expect(wrapper.find('.next-button').text()).toBe('Complete');

    await clickNext(wrapper);

    const payload = wrapper.emitted('complete')[0][0];

    expect(payload.academicLevel).toBe('master');

    expect(payload.schoolPath.bachelorSchool.institutionId).toBe('school-ensias');
    expect(payload.schoolPath.masterSchool.institutionId).toBe('school-emsi');
    expect(payload.schoolPath.masterSchool.startYear).toBe('2021');
    expect(payload.schoolPath.masterSchool.endYear).toBe('2023');
  });

  it('goes back to the previous step and resets the current step value', async () => {
    const wrapper = mountModal();

    await selectStudyStatus(wrapper, 'I am currently studying');
    await clickNext(wrapper);

    await selectAcademicLevel(wrapper, 'Bachelor / Licence');

    expect(wrapper.find('.next-button').element.disabled).toBe(false);

    await clickBack(wrapper);

    expect(wrapper.text()).toContain('Study status');

    await clickNext(wrapper);

    expect(wrapper.text()).toContain('Academic level');
    expect(wrapper.find('.next-button').element.disabled).toBe(true);
  });

  it('emits close when clicking the close button', async () => {
    const wrapper = mountModal();

    await wrapper.find('[data-test="close-button"]').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when clicking the overlay background', async () => {
    const wrapper = mountModal();

    await wrapper.find('.modal-overlay').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close when clicking Close on the first step', async () => {
    const wrapper = mountModal();

    await wrapper.find('.back-button').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });
});