<script setup>
defineProps({
    size: {
        type: String,
        default: 'md'
    }
});
</script>

<template>
    <div
        :class="`spinner--${size}`"
        class="spinner"
    />
</template>

<style scoped>
.spinner--md {
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
}

.spinner--lg {
    width: 2rem;
    height: 2rem;
    border: 3px solid currentColor;
}

.spinner {
    border-top-color: transparent;
    border-radius: 999px;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>