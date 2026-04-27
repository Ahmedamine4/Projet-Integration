<script setup>
defineProps({
    title: {
        type: String,
        default: '',
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

        <h2 v-if="title">
            {{ title }}
        </h2>
        <slot />
    </div>
</template>

<style scoped>
.card {
    margin: 0 auto;
    padding: 0;
    border: none;
    background: transparent;
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
}

.card > h2 {
    margin: 0 0 0.45rem;
    font-size: clamp(1.7rem, 2.4vw, 2.5rem);
    line-height: 1;
    color: var(--color-primary);
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
