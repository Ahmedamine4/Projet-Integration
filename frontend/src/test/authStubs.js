const InputStub = {
  props: [
    'modelValue',
    'label',
    'type',
    'placeholder',
    'name',
    'id',
    'error',
    'required',
  ],
  emits: ['update:modelValue'],
  template: `
    <div>
      <label v-if="label">{{ label }}</label>
      <input
        :id="id"
        :name="name"
        :type="type || 'text'"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <p v-if="error">{{ error }}</p>
    </div>
  `,
};

const ButtonStub = {
  props: ['type', 'disabled', 'loading'],
  template: `
    <button :type="type || 'submit'" :disabled="disabled">
      <slot />
    </button>
  `,
};

const ErrorStub = {
  template: '<div data-test="error"><slot /></div>',
};

const CardStub = {
  props: ['title', 'size'],
  template: `
    <div data-test="card">
      <h2 v-if="title">{{ title }}</h2>
      <slot />
    </div>
  `,
};

const AuthFooterStub = {
  props: ['message', 'linkText', 'to'],
  template: `
    <div data-test="auth-footer">
      <span>{{ message }}</span>
      <a :href="to">{{ linkText }}</a>
    </div>
  `,
};

const DividerStub = {
  template: '<div data-test="divider"><slot /></div>',
};

const SpinnerStub = {
  template: '<div data-test="spinner">Loading...</div>',
};

const RouterLinkStub = {
  props: ['to'],
  template: '<a><slot /></a>',
};

export const authStubs = {
  Card: CardStub,
  Input: InputStub,
  Button: ButtonStub,
  Error: ErrorStub,
  AuthFooter: AuthFooterStub,
  Divider: DividerStub,
  Spinner: SpinnerStub,
  RouterLink: RouterLinkStub,
};
export const buttonByText = (wrapper, text) => {
  const button = wrapper.findAll('button').find((btn) =>
    btn.text().includes(text)
  );

  if (!button) {
    throw new Error(`Button with text "${text}" not found`);
  }

  return button;
};
export const commonStubs = authStubs;

export const registerStubs = authStubs;

export default authStubs;