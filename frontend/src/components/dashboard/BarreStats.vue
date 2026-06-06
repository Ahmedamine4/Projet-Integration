<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    categories: {
        type: Array,
        required: true
        // Format:
        // [{ label: 'Photos', value: 45 }]
    },
    title: {
        type: String,
        default: 'Stockage'
    },
    subtitle: {
        type: String,
        default: ''
    }
})

const hoveredCategory = ref(null)

function getGradientColor(index, total) {
    const start = { r: 236, g: 108, b: 15 } // #ec6c0f
    const middle = { r: 255, g: 230, b: 0 } // jaune
    const end = { r: 35, g: 162, b: 121 } // #23a279

    const ratio = total > 1
        ? index / (total - 1)
        : 0

    let r
    let g
    let b

    if (ratio < 0.5) {
        const t = ratio * 2

        r = start.r + (middle.r - start.r) * t
        g = start.g + (middle.g - start.g) * t
        b = start.b + (middle.b - start.b) * t
    } else {
        const t = (ratio - 0.5) * 2

        r = middle.r + (end.r - middle.r) * t
        g = middle.g + (end.g - middle.g) * t
        b = middle.b + (end.b - middle.b) * t
    }

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

const categoriesWithColors = computed(() => {
    const total =
        props.categories.reduce(
            (sum, cat) => sum + cat.value,
            0
        )

    return props.categories.map(
        (cat, index) => ({
            ...cat,

            // Affichage en %
            percent: (
                (cat.value / total) * 100
            ).toFixed(1),

            // Dernière catégorie = gris
            color:
                index ===
                    props.categories.length - 1
                    ? '#c0c0c0'
                    : getGradientColor(
                        index,
                        props.categories.length - 1
                    )
        })
    )
})
</script>

<template>
    <div class="storage-content">
        <div class="storage-bar-container">
            <div class="storage-bar">
                <div v-for="category in categoriesWithColors" :key="category.label" class="storage-segment" :class="{
                    dimmed:
                        hoveredCategory &&
                        hoveredCategory !== category.label
                }" :style="{
                    '--percent':
                        (category.percent),
                    background:
                        category.color
                }" @mouseenter="
                    hoveredCategory =
                    category.label
                    " @mouseleave="
                    hoveredCategory =
                    null
                    " />

            </div>
        </div>
        <!-- LEGEND -->
        <div class="legend">
            <div v-for="
category
    in categoriesWithColors
          " :key="category.label" class="legend-item" :class="{
            dimmed:
                hoveredCategory &&
                hoveredCategory !== category.label,

            active:
                hoveredCategory ===
                category.label
        }" @mouseenter="
            hoveredCategory =
            category.label
            " @mouseleave="
                hoveredCategory =
                null
                ">

                <div class="legend-color" :style="{
                    background:
                        category.color
                }" />

                <div class="legend-info">

                    <span class="legend-label">
                        {{ category.label }}
                    </span>

                    <span class="legend-size">
                        {{ category.value }}%
                    </span>

                </div>

            </div>

        </div>

    </div>
</template>

<style scoped>
.section {
    background:
        var(--color-background);

    border:
        1px solid rgba(var(--color-primary-rgb),
            .08);

    border-radius: 28px;

    overflow: hidden;
}

.section-header {
    padding: 2rem;

    border-bottom:
        1px solid rgba(var(--color-primary-rgb),
            .08);
}

.header-content h2 {
    margin: 0;

    color:
        var(--color-primary);
}

.subtitle {
    margin-top: .4rem;

    color:
        rgba(var(--color-primary-rgb),
            .6);
}

/* CONTENT */

.storage-content {
    padding: 2rem;

    display: flex;

    flex-direction: column;

    gap: 2rem;
}

/* BAR */

.storage-bar {
    display: flex;

    gap: 2px;

    height: 42px;

    background: #f3f4f6;

    padding: 4px;

    border-radius: 18px;

    overflow: hidden;
}

.storage-segment {
    flex:
        0 0 calc(var(--percent) * 1%);

    min-width: 12px;

    border-radius: 10px;

    position: relative;

    cursor: pointer;

    transition:
        .25s;
}

.storage-segment::after {
    content: '';

    position: absolute;

    inset: 0;

    border-radius: inherit;

    background:
        linear-gradient(135deg,
            rgba(255,
                255,
                255,
                .18),
            transparent 45%);
}

.storage-segment:hover {
    filter:
        brightness(.95);

    transform:
        scaleY(1.03);
}

.storage-segment.dimmed {
    opacity: .3;
}

/* LEGEND */

.legend {
    display: grid;

    grid-template-columns:
        repeat(auto-fit,
            minmax(180px,
                1fr));

    gap: 1rem;
}

.legend-item {
    display: flex;

    gap: .8rem;

    padding: .8rem;

    border-radius: 12px;

    transition: .25s;
}

.legend-item:hover {
    background:
        rgba(var(--color-primary-rgb),
            .05);
}

.legend-item.active {
    background:
        rgba(var(--color-primary-rgb),
            .08);
}

.legend-item.dimmed {
    opacity: .3;
}

.legend-color {
    width: 18px;

    height: 18px;

    border-radius: 6px;

    flex-shrink: 0;
}

.legend-info {
    display: flex;

    flex-direction: column;
}

.legend-label {
    font-weight: 600;
}

.legend-size {
    color:
        rgba(var(--color-primary-rgb),
            .6);
}

@media (max-width:768px) {
    .storage-content {
        padding: 1.25rem;
    }

    .storage-bar {
        height: 34px;
    }
}
</style>