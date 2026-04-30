<script setup>
import { ArrowDown, CircleCheck, CircleDashed } from 'lucide-vue-next';
import { computed } from 'vue';
import Input from '@/components/Input.vue';
import Dropdown from '@/components/Dropdown.vue';

const model = defineModel({
    type: String,
    default: '',
});

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    done: {
        type: Boolean,
        default: false,
    },
    expanded: {
        type: Boolean,
        default: false,
    },
    placeholder: {
        type: String,
        required: true,
    },
    confirmText: {
        type: String,
        default: 'Confirm',
    },
    lockWhenDone: {
        type: Boolean,
        default: true,
    },
    options: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['toggle', 'complete']);

function handleToggle() {
    if (!props.lockWhenDone || !props.done) emit('toggle');
}

const hasOptions = computed(() => props.options.length > 0);
</script>

<template>
    <div 
        class="step"
        :class="{
            expanded,
            done: lockWhenDone && done
        }"
        @click="handleToggle"
    >
        <div class="step-main">
            <div class="left">
                <CircleCheck
                    v-if="done"
                    class="step-icon"
                />
                <CircleDashed
                    v-else
                    class="step-icon loading"
                />
                <div class="description">
                    <h3>{{ title }}</h3>
                    <p>{{ description }}</p>
                </div>
            </div>

            <div class="step-arrow-wrapper">
                <ArrowDown
                    class="step-arrow"
                    :class="{ rotated: expanded }"
                />
            </div>
        </div>
        <Transition
            name="step-expandable"
        >
            <div class="step-expandable" v-if="expanded" @click.stop>
                <div class="step-field">
                    <Dropdown
                        v-if="hasOptions"
                        v-model="model"
                        :options
                        :placeholder
                    />
                    <Input
                        v-else
                        v-model="model"
                        label=""
                        :placeholder
                    />
                </div>

                <button
                    class="step-confirm"
                    @click="emit('complete')"
                >
                    {{ confirmText }}
                </button>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.step {
    position: relative;
    border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
    cursor: pointer;
    transition: var(--transition-normal);
}

h3 {
    font-size: var(--font-size-md);
    font-weight: var(--font-medium);
    margin: 0;
}

p {
    font-size: var(--font-size-sm);
    font-weight: var(--font-regular);
    color: rgba(var(--color-primary-rgb), 0.6);
    margin: 0;
}

.step-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
}

.left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.description {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.step-icon {
    align-self: flex-start;
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-background);
    fill: var(--color-success);
}

.step-icon.loading {
    scale: 0.8;
    color: rgba(var(--color-primary-rgb), 0.3);
    fill: var(--color-primary);
}

.step-arrow-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 1rem;
}

.step-arrow {
    transition: transform 0.25s ease;
    transform: rotate(-90deg);
}

.step-arrow.rotated {
    transform: rotate(0deg);
}

.step-expandable {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0 1.5rem 1.5rem 1.5rem;
}

.step-field {
    flex: 1;
}
.step-confirm {
    padding: 0.6rem 1.25rem;
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-success);
    color: var(--color-background);
    font-size: var(--font-size-sm);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: opacity 0.2s ease;
    white-space: nowrap;
}

.step-confirm:hover {
    opacity: 0.85;
}

.step.done {
    cursor: default;
}

.step.expanded {
    z-index: 20;
}

.step:hover:not(.done) {
    background-color: rgba(var(--color-surface-rgb), 0.3);
}

.step-expandable-enter-active,
.step-expandable-leave-active {
    transition: var(--transition-normal);
    overflow: hidden;
}

.step-expandable-enter-from,
.step-expandable-leave-to {
    max-height: 0;
    opacity: 0;
    padding-block: 0;
}

.step-expandable-enter-to,
.step-expandable-leave-from {
    max-height: 8rem;
    opacity: 1;
}

.step-expandable-leave-active :deep(.dropdown__list) {
    display: none;
}
</style>
