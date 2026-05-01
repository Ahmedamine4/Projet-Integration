<script setup>
defineProps({
    variant: {
        type: String,
        default: 'global'
    }
});
</script>

<template>
    <p :class="`error--${variant}`">
        <slot />
    </p>
</template>

<style scoped>
.error--field {
    color: var(--color-error);
    font-size: 12px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.error--global {
    color: var(--color-error);
    font-size: 13px;
    text-align: center;
}
</style>