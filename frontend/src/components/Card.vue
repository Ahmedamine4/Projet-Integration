<script setup>
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
    size: {
        type: String,
        default: 'md'
    }
});
</script>

<template>
    <div
        :class="[
            'card',
            `card--${size}`,
            { 'card--full-width': fullWidth }
        ]"
    >

        <component :is="titleLevel" v-if="title">
            {{ title }}
        </component>
        <slot />
    </div>
</template>

<style scoped>
.card {
    margin: 0 auto;
    padding: 0;
    border: none;
    background: transparent;
    box-shadow: none;
}

.card--xs {
    width: min(100%, 22rem);
}

.card--sm {
    width: min(100%, 24rem);
}

.card--md {
    width: min(100%, 26rem);
}

.card--lg {
    width: min(100%, 28rem);
}

.card--full-width {
    width: 100%;
    max-width: none;
}

.card > h2 {
    margin: 0 0 0.45rem;
    font-size: clamp(1.7rem, 2.4vw, 2.5rem);
    line-height: 1;
    color: var(--color-primary);
}

.card--panel {
    width: min(100%, 32rem);
    margin: calc(3 * var(--space-xl)) auto 0;
    padding: var(--space-lg);
    background-color: var(--color-surface);
    border: 1px solid var(--color-primary-hover);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

@media (max-width: 480px) {
    .card--xs,
    .card--sm,
    .card--md,
    .card--lg {
        width: 100%;
    }
}
</style>
