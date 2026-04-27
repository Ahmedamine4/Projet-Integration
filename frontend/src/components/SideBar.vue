<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
</script>
<template>
    <div v-if="isOpen" class="backdrop" @click="isOpen = false"></div>
    <div class="sidebar" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
        <div class="sidebar-header">
            <img src="../assets/logo_FolioCraft.svg" alt="logo" class="logo" />
            <Transition name="fade">
                <span v-if="isOpen" class="brand">Folio Craft</span>
            </Transition>
        </div>
        <nav>
            <button class="sidebar-item" @click="router.push('/test')">
                <span class="sidebar-item-icon">+</span>
                <Transition name="fade">
                    <span v-if="isOpen" class="sidebar-item-label">Test1</span>
                </Transition>
            </button>
            <button class="sidebar-item" @click="router.push('/test')">
                <span class="sidebar-item-icon">-</span>
                <Transition name="fade">
                    <span v-if="isOpen" class="sidebar-item-label">Test2</span>
                </Transition>
            </button>
            <button class="sidebar-item" @click="router.push('/test')">
                <span class="sidebar-item-icon">X</span>
                <Transition name="fade">
                    <span v-if="isOpen" class="sidebar-item-label">Test3</span>
                </Transition>
            </button>
        </nav>
        <div class="sidebar-footer">
            <button class="sidebar-item" @click="router.push('/test')">
                <span class="sidebar-item-icon">🔔</span>
                <Transition name="fade">
                    <span v-if="isOpen" class="sidebar-item-label">Notifications</span>
                </Transition>
            </button>
            <button class="sidebar-item">
                <span class="sidebar-item-icon">👤</span>
                <Transition name="fade">
                    <span v-if="isOpen" class="sidebar-item-label">My Profile</span>
                </Transition>
            </button>
            <button class="sidebar-item" @click="router.push('/test')">
                <span class="sidebar-item-icon">⚙️</span>
                <Transition name="fade">
                    <span v-if="isOpen" class="sidebar-item-label">Settings</span>
                </Transition>
            </button>
        </div>
    </div>
</template>
<style scoped>
.backdrop {
    position: fixed;
    inset: 0;
    z-index: 999;
}
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: clamp(50px, 5vw, 60px);  /*clamp(40px, 10vw, 80px);  */
    z-index: 1000;
    background: var(--color-primary);
    padding: var(--space-md) var(--space-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    transition: width var(--transition-slow);
    overflow: hidden;
    border-radius: 0 var(--space-md) var(--space-md) 0;
}
.sidebar.open {
    width: clamp(200px, 20vw, 240px);
}
.sidebar:hover{
    width: clamp(200px,20vw,240px);
}
.sidebar-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    justify-content: flex-start;
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--color-primary-hover);
    white-space: nowrap;
    min-height: 40px;
}
.brand {
    color: var(--color-background);
    font-size: var(--font-size-lg);
    font-weight: var(--font-bold);
    margin: 0;
    flex: 1;
}
.brand span { 
    color: var(--color-secondary);
}
.close-btn:hover {
    opacity: 1; 
}
nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    flex: 1;
}
.sidebar-footer {
    display: flex;
    align-items: left;
    gap: var(--space-sm);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-primary-hover);
    color: var(--color-secondary);
    white-space: nowrap;
    flex-direction: column;
}
.fade-enter-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
    transition-delay: 0.15s;
}
.fade-enter-from {
    opacity: 0;
    transform: translateX(-10px);
}
.fade-leave-active{
    transition: none;
}
.fade-leave-to{
    opacity: 0;
}
.nav-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.logo {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    filter: invert(1);
}
.sidebar-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    background: none;
    border: none;
    color: var(--color-background);
    font-size: var(--font-size-sm);
    text-align: left;
    padding: var(--space-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    opacity: 0.7;
    white-space: nowrap;
    width: 100%;
}
.sidebar-item:hover {
    background: var(--color-primary-hover);
    opacity: 1;
}
.sidebar-item-icon {
    font-size: var(--font-size-lg);
    flex-shrink: 0;
    width: 24px;
    text-align: center;
}
.sidebar-item-label {
    flex: 1;
}
</style>