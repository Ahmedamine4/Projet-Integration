import { defineComponent, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ImageDropzone from './ImageDropzone.vue';

vi.mock('lucide-vue-next', () => ({
  ImagePlus: {
    name: 'ImagePlus',
    template: '<svg data-test="image-plus-icon" />',
  },
  Trash2: {
    name: 'Trash2',
    props: ['size'],
    template: '<svg data-test="trash-icon" />',
  },
  UploadCloud: {
    name: 'UploadCloud',
    props: ['size'],
    template: '<svg data-test="upload-icon" />',
  },
}));

const ImageCropperModalStub = defineComponent({
  name: 'ImageCropperModal',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    file: {
      type: Object,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
    outputWidth: {
      type: Number,
      default: 1280,
    },
    outputHeight: {
      type: Number,
      default: 720,
    },
  },
  emits: ['close', 'crop'],
  setup(props, { emit }) {
    function emitCrop() {
      const croppedFile = new File(['cropped image'], 'cropped.png', {
        type: 'image/png',
      });

      emit('crop', croppedFile);
    }

    function closeCropper() {
      emit('close');
    }

    return {
      props,
      emitCrop,
      closeCropper,
    };
  },
  template: `
    <div v-if="open" data-test="cropper-modal">
      <button
        type="button"
        data-test="close-cropper"
        @click="closeCropper"
      >
        Close cropper
      </button>

      <button
        type="button"
        data-test="emit-crop"
        @click="emitCrop"
      >
        Crop
      </button>
    </div>
  `,
});

function createFile(name = 'project.png', type = 'image/png') {
  return new File(['fake image content'], name, {
    type,
  });
}

function mountUpload(props = {}) {
  let wrapper;

  wrapper = mount(ImageDropzone, {
    props: {
      modelValue: null,
      ...props,
      'onUpdate:modelValue': async (value) => {
        await wrapper.setProps({
          modelValue: value,
        });
      },
    },
    global: {
      stubs: {
        ImageCropperModal: ImageCropperModalStub,
      },
    },
  });

  return wrapper;
}

async function selectFile(wrapper, file) {
  const input = wrapper.find('input[type="file"]');

  Object.defineProperty(input.element, 'files', {
    value: [file],
    configurable: true,
  });

  await input.trigger('change');
  await flushPromises();
}

describe('ImageDropzone', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:preview-url'),
      writable: true,
    });

    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
    });
  });

  it('renders title, subtitle and empty text by default', () => {
    const wrapper = mountUpload();

    expect(wrapper.text()).toContain('Upload project screenshot');
    expect(wrapper.text()).toContain('PNG, JPG, or WebP. Click to browse.');
    expect(wrapper.text()).toContain('No file selected');

    expect(wrapper.find('[data-test="image-plus-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="upload-icon"]').exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('displays the initial preview and file name', () => {
    const wrapper = mountUpload({
      initialPreviewUrl: 'https://example.com/old-image.png',
      initialFileName: 'old-image.png',
    });

    const image = wrapper.find('img');

    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('https://example.com/old-image.png');
    expect(wrapper.text()).toContain('old-image.png');
    expect(wrapper.find('.drop-zone__clear').exists()).toBe(true);
  });

  it('emits update:modelValue and displays preview when selecting a file without crop', async () => {
    const wrapper = mountUpload();
    const file = createFile('project-preview.png');

    await selectFile(wrapper, file);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([file]);

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(wrapper.find('img').attributes('src')).toBe('blob:preview-url');
    expect(wrapper.text()).toContain('project-preview.png');
  });

  it('activates the drop zone on dragover and removes active state on dragleave', async () => {
    const wrapper = mountUpload();
    const dropZone = wrapper.find('.drop-zone');

    expect(dropZone.classes()).not.toContain('drop-zone--active');

    await dropZone.trigger('dragover');
    expect(dropZone.classes()).toContain('drop-zone--active');

    await dropZone.trigger('dragleave');
    expect(dropZone.classes()).not.toContain('drop-zone--active');
  });

  it('selects a file when it is dropped', async () => {
    const wrapper = mountUpload();
    const file = createFile('dropped-image.png');

    await wrapper.find('.drop-zone').trigger('drop', {
      dataTransfer: {
        files: [file],
      },
    });

    await flushPromises();

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([file]);
    expect(wrapper.text()).toContain('dropped-image.png');
  });

  it('clears the selected file and preview when clicking the clear button', async () => {
    const wrapper = mountUpload();
    const file = createFile('project-preview.png');

    await selectFile(wrapper, file);

    expect(wrapper.text()).toContain('project-preview.png');
    expect(wrapper.find('img').exists()).toBe(true);

    await wrapper.find('.drop-zone__clear').trigger('click');
    await flushPromises();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-url');
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([null]);
    expect(wrapper.text()).toContain('No file selected');
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('opens the cropper instead of updating directly when crop size is provided', async () => {
    const wrapper = mountUpload({
      cropWidth: 1280,
      cropHeight: 720,
    });

    const file = createFile('to-crop.png');

    await selectFile(wrapper, file);

    expect(wrapper.find('[data-test="cropper-modal"]').exists()).toBe(true);

    const cropper = wrapper.findComponent(ImageCropperModalStub);

    expect(cropper.props('open')).toBe(true);
    expect(cropper.props('file')).toBe(file);
    expect(cropper.props('outputWidth')).toBe(1280);
    expect(cropper.props('outputHeight')).toBe(720);

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('emits the cropped file and closes the cropper after crop', async () => {
    const wrapper = mountUpload({
      cropWidth: 1280,
      cropHeight: 720,
    });

    const file = createFile('to-crop.png');

    await selectFile(wrapper, file);

    await wrapper.find('[data-test="emit-crop"]').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();

    const croppedFile = wrapper.emitted('update:modelValue')[0][0];

    expect(croppedFile).toBeInstanceOf(File);
    expect(croppedFile.name).toBe('cropped.png');

    expect(wrapper.find('[data-test="cropper-modal"]').exists()).toBe(false);
  });

  it('closes the cropper without updating when cropper emits close', async () => {
    const wrapper = mountUpload({
      cropWidth: 1280,
      cropHeight: 720,
    });

    const file = createFile('to-crop.png');

    await selectFile(wrapper, file);

    expect(wrapper.find('[data-test="cropper-modal"]').exists()).toBe(true);

    await wrapper.find('[data-test="close-cropper"]').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-test="cropper-modal"]').exists()).toBe(false);
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('resets cleared initial preview when initialPreviewUrl changes', async () => {
    const wrapper = mountUpload({
      initialPreviewUrl: 'https://example.com/old-image.png',
      initialFileName: 'old-image.png',
    });

    await wrapper.find('.drop-zone__clear').trigger('click');
    await nextTick();

    expect(wrapper.find('img').exists()).toBe(false);

    await wrapper.setProps({
      initialPreviewUrl: 'https://example.com/new-image.png',
      initialFileName: 'new-image.png',
    });

    await nextTick();

    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/new-image.png');
    expect(wrapper.text()).toContain('new-image.png');
  });

  it('revokes preview URL when component is unmounted', async () => {
    const wrapper = mountUpload();
    const file = createFile('project-preview.png');

    await selectFile(wrapper, file);

    wrapper.unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-url');
  });
});