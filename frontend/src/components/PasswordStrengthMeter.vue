<script setup>
import { computed } from 'vue';
const props = defineProps({
    password: {
        type: String,
        default: '',
    }
})

const rules = computed(() => [
    {
        label: '8+ characters',
        passed: props.password.length >= 8
    },
    {
        label: 'Alphabetic letter',
        passed: /[A-Za-z]/.test(props.password)
    },
    {
        label: 'Number', passed: /\d/.test(props.password)
    },
    {
        label: 'Symbol',
        passed: /[^A-Za-z0-9]/.test(props.password)
    }
]);

const strength = computed(() => {
    const score = rules.value.filter(rule => rule.passed).length;
    if (score <= 1) return { label: 'Weak', score };
    if (score === 2) return { label: 'Fair', score };
    if (score === 3) return { label: 'Good', score };

    return { label: 'Strong', score };
})

const meterStyle = computed(() => ({
    width: `${strength.value.score * 25}%`
}));
</script>

<template>
    <Transition name="password-meter">
        <section
            v-if="password"
            class="password-meter"
            :class="`password-meter--${strength.label.toLowerCase()}`"
        >
            <div class="password-meter__header">
                <span class="password-meter__label">
                    Password strength
                </span>
                <strong class="password-meter__status">
                    {{ strength.label }}
                </strong>
            </div>
            <div class="password-meter__track">
                <span
                    class="password-meter__fill"
                    :style="meterStyle"
                />
            </div>
            <ul class="password-meter__rules">
                <li
                    v-for="rule in rules"
                    :key="rule.label"
                    class="password-meter__rule"
                    :class="{ 'password-meter__rule--passed': rule.passed }"
                >
                    <input
                        class="password-meter__checkbox"
                        type="checkbox"
                        :checked="rule.passed"
                        tabindex="-1"
                    >
                    <span>{{ rule.label }}</span>
                </li>
            </ul>
        </section>
    </Transition>
</template>

<style scoped>
.password-meter {
    display: grid;
    gap: 0.45rem;
    margin-bottom: var(--space-md);
}

.password-meter-enter-from,
.password-meter-leave-to {
    margin-bottom: 0;
    max-height: 0;
    opacity: 0;
    transform: translateY(-0.35rem);
}

.password-meter-enter-active,
.password-meter-leave-active {
    overflow: hidden;
    transition:
        max-height var(--transition-normal),
        opacity var(--transition-normal),
        transform var(--transition-normal),
        margin-bottom var(--transition-normal);
}


.password-meter-enter-to,
.password-meter-leave-from {
    margin-bottom: var(--space-md);
    max-height: 4.5rem;
    opacity: 1;
    transform: translateY(0);
}

.password-meter--weak {
    --meter-color: var(--color-error);
}

.password-meter--fair {
    --meter-color: #e07012;
}

.password-meter--good {
    --meter-color: #d9b20b;
}

.password-meter--strong {
    --meter-color: var(--color-success);
}

.password-meter__header {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-xs);
}

.password-meter__label {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.6rem;
    color: rgba(var(--color-primary-rgb), 0.78);
}

.password-meter__status {
    color: var(--meter-color);
}

.password-meter__track {
    overflow: hidden;
    height: 0.38rem;
    border-radius: 999px;
    background-color: rgba(var(--color-primary-rgb), 0.12);
}

.password-meter__fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--meter-color);
    transition: 
        width 0.48s var(--ease-overshoot),
        background-color var(--transition-normal);
}

.password-meter__rules {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem 0.75rem;
    padding: 0;
    margin: 0;
    list-style: none;
}

.password-meter__rule {
    display: grid;
    grid-template-columns: 0.9rem 1fr;
    align-items: center;
    column-gap: 0.3rem;
    font-size: var(--font-size-xs);
    color: rgba(var(--color-primary-rgb), 0.58);
}

.password-meter__rule--passed {
    color: var(--color-success);
}

.password-meter__checkbox {
    width: 0.9rem;
    height: 0.9rem;
    margin: 0;
    accent-color: var(--color-success);
    pointer-events: none;
}
</style>
