<script setup>
defineOptions({
    inheritAttrs: false,
});

defineProps({
    title: {
        type: String,
        default: '',
    },
    titleLevel: {
        type: String,
        default: 'h2',
    },
    fullWidth: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div :class="['card', { 'card--full-width': fullWidth }]" v-bind="$attrs">
        <component :is="titleLevel" v-if="title">
            {{ title }}
        </component>
        <slot />
    </div>
</template>

<style scoped>
.card {
    width: min(100%, 32rem);
    margin: calc(3 * var(--space-xl)) auto 0;
    padding: var(--space-lg);
    background-color: var(--color-surface);
    border: 1px solid var(--color-primary-hover);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.card--full-width {
    width: 100%;
    max-width: none;
}
</style>
