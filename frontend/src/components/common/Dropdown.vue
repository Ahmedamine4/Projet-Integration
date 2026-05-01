<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import Input from '@/components/common/Input.vue';

const model = defineModel({
    type: String,
    default: '',
});

const props = defineProps({
    options: {
        type: Array,
        required: true,
    },
    placeholder: {
        type: String,
        default: '',
    },
    visibleOptions: {
        type: Number,
        default: 4,
    },
});

const isOpen = ref(false);

const dropdownElement = ref(null);

const filteredOptions = computed(() => {
    const search = model.value.trim().toLowerCase();
    if (!search) return props.options;

    return props.options.filter(option => {
        return option.toLowerCase().includes(search);
    });
});

const shouldShowOptions = computed(() => {
    return isOpen.value && filteredOptions.value.length > 0;
});

function selectOption(option) {
    model.value = option;
    isOpen.value = false;
}

function closeOnOutsideClick(event) {
    if (!dropdownElement.value?.contains(event.target))
        isOpen.value = false;
}

onMounted(() => {
    document.addEventListener('click', closeOnOutsideClick);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', closeOnOutsideClick);
});
</script>

<template>
    <div ref="dropdownElement" class="dropdown">
        <Input
            v-model="model"
            label=""
            :placeholder
            @focus="isOpen = options.length > 0"
        />

        <div
            class="dropdown__list"
            v-if="shouldShowOptions"
            :style="{ '--visible-options': visibleOptions }"
        >
            <button
                class="dropdown__option"
                v-for="option in filteredOptions"
                :key="option"
                type="button"
                @click="selectOption(option)"
            >
                {{ option }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.dropdown {
    position: relative;
}

.dropdown__list {
    position: absolute;
    z-index: 100;
    top: calc(100% + var(--space-xs));
    left: 0;
    right: 0;
    display: grid;
    border: 1px solid rgba(var(--color-primary-rgb), 0.12);
    border-radius: var(--radius-md);
    background: var(--color-background);
    box-shadow: var(--shadow-md);
    max-height: calc(2.75rem * var(--visible-options));
    overflow: auto;
}

.dropdown__option {
    width: 100%;
    height: 2.75rem;
    padding: 0.65rem 0.75rem;
    border: 0;
    border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
    background: transparent;
    white-space: nowrap;
    color: var(--color-primary);
    font: inherit;
    font-size: var(--font-size-sm);
    text-align: left;
    cursor: pointer;
}

.dropdown__option:last-child {
    border-bottom: 0;
}

.dropdown__option:hover {
    background: rgba(var(--color-surface-rgb), 0.55);
}
</style>
