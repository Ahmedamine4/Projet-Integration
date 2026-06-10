import { defineComponent } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ImageCropperModal from './ImageCropperModal.vue';

const cropperState = vi.hoisted(() => ({
  toBlobMock: vi.fn(),
}));

vi.mock('vue-advanced-cropper', () => ({
  Cropper: {
    name: 'Cropper',
    props: [
      'src',
      'stencilProps',
      'canvas',
      'imageRestriction',
      'autoZoom',
      'transitions',
    ],
    setup(props, { expose }) {
      expose({
        getResult: () => ({
          canvas: {
            toBlob: cropperState.toBlobMock,
          },
        }),
      });

      return {
        props,
      };
    },
    template: '<div data-test="cropper">Cropper</div>',
  },
}));

const BaseButtonStub = defineComponent({
  name: 'BaseButton',
  props: {
    variant: {
      type: String,
      default: 'pill',
    },
  },
  emits: ['click'],
  template: `
    <button
      data-test="base-button"
      :data-variant="variant"
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

function createImageFile(name = 'avatar.png', type = 'image/png') {
  return new File(['fake image content'], name, {
    type,
  });
}

function mountModal(props = {}) {
  return mount(ImageCropperModal, {
    props: {
      open: false,
      file: null,
      ...props,
    },
    global: {
      stubs: {
        BaseButton: BaseButtonStub,
        CloseButton: CloseButtonStub,
        Teleport: true,
        Transition: true,
      },
    },
  });
}

describe('ImageCropperModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:mock-image-url'),
      writable: true,
    });

    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
    });

    cropperState.toBlobMock.mockImplementation((callback, type) => {
      callback(
        new Blob(['cropped image content'], {
          type,
        })
      );
    });
  });

  it('does not render the modal when open is false', () => {
    const wrapper = mountModal();

    expect(wrapper.find('.cropper-modal').exists()).toBe(false);
  });

  it('renders the modal with title, output size and cropper when open is true', () => {
    const file = createImageFile();

    const wrapper = mountModal({
      open: true,
      file,
      title: 'Crop profile photo',
      outputWidth: 760,
      outputHeight: 820,
    });

    expect(wrapper.find('.cropper-modal').exists()).toBe(true);
    expect(wrapper.text()).toContain('Crop profile photo');
    expect(wrapper.text()).toContain('760 x 820 px');
    expect(wrapper.find('[data-test="cropper"]').exists()).toBe(true);

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it('passes the correct props to Cropper', () => {
    const file = createImageFile();

    const wrapper = mountModal({
      open: true,
      file,
      outputWidth: 1280,
      outputHeight: 720,
    });

    const cropper = wrapper.findComponent({ name: 'Cropper' });

    expect(cropper.exists()).toBe(true);
    expect(cropper.props('src')).toBe('blob:mock-image-url');

    expect(cropper.props('stencilProps')).toEqual({
      aspectRatio: 1280 / 720,
    });

    expect(cropper.props('canvas')).toEqual({
      width: 1280,
      height: 720,
    });

    expect(cropper.props('imageRestriction')).toBe('stencil');
    expect(cropper.props('autoZoom')).toBe(true);
    expect(cropper.props('transitions')).toBe(true);
  });

  it('emits close when clicking the close button', async () => {
    const wrapper = mountModal({
      open: true,
      file: createImageFile(),
    });

    await wrapper.find('[data-test="close-button"]').trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when clicking Cancel', async () => {
    const wrapper = mountModal({
      open: true,
      file: createImageFile(),
    });

    const cancelButton = wrapper
      .findAll('[data-test="base-button"]')
      .find((button) => button.text() === 'Cancel');

    await cancelButton.trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits a cropped File when clicking Crop image', async () => {
    const file = createImageFile('profile.png', 'image/png');

    const wrapper = mountModal({
      open: true,
      file,
    });

    const cropButton = wrapper
      .findAll('[data-test="base-button"]')
      .find((button) => button.text() === 'Crop image');

    await cropButton.trigger('click');
    await flushPromises();

    expect(cropperState.toBlobMock).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png',
      0.92
    );

    expect(wrapper.emitted('crop')).toBeTruthy();

    const croppedFile = wrapper.emitted('crop')[0][0];

    expect(croppedFile).toBeInstanceOf(File);
    expect(croppedFile.name).toBe('profile-cropped.png');
    expect(croppedFile.type).toBe('image/png');
  });

  it('uses jpg extension when the file is not png', async () => {
    const file = createImageFile('banner.jpeg', 'image/jpeg');

    const wrapper = mountModal({
      open: true,
      file,
    });

    const cropButton = wrapper
      .findAll('[data-test="base-button"]')
      .find((button) => button.text() === 'Crop image');

    await cropButton.trigger('click');
    await flushPromises();

    const croppedFile = wrapper.emitted('crop')[0][0];

    expect(croppedFile.name).toBe('banner-cropped.jpg');
    expect(croppedFile.type).toBe('image/jpeg');
  });

  it('revokes the previous object URL when the file changes', async () => {
    const firstFile = createImageFile('first.png');
    const secondFile = createImageFile('second.png');

    URL.createObjectURL
      .mockReturnValueOnce('blob:first-image')
      .mockReturnValueOnce('blob:second-image');

    const wrapper = mountModal({
      open: true,
      file: firstFile,
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(firstFile);

    await wrapper.setProps({
      file: secondFile,
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:first-image');
    expect(URL.createObjectURL).toHaveBeenCalledWith(secondFile);
  });

  it('revokes the object URL when the component is unmounted', () => {
    URL.createObjectURL.mockReturnValueOnce('blob:image-to-clean');

    const wrapper = mountModal({
      open: true,
      file: createImageFile(),
    });

    wrapper.unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:image-to-clean');
  });
});