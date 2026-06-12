<script setup>
import { ref, computed, watch, onMounted} from 'vue';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter.vue';
import Input from '@/components/common/forms/BaseInput.vue';
import Error from '@/components/common/feedback/BaseError.vue';
import { Settings } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useGithubStore } from '@/stores/github';

const avatarPreview = ref('');
const fileInput = ref(null);
const tempAvatarPreview = ref('');
const tempAvatarFile = ref(null);
const showImageConfirm = ref(false);
const uploadingAvatar = ref(false);

const authStore = useAuthStore();
const userStore = useUserStore();
const githubStore = useGithubStore();
const user = computed(() => authStore.user);

const firstName = ref('');
const lastName = ref('');
const email = ref('');

const originalFirstName = ref('');
const originalLastName = ref('');

watch(user, (u) => {
  firstName.value = u?.prenom || u?.firstName || '';
  lastName.value = u?.nom || u?.lastName || '';
  email.value = u?.email || u?.emailAddress || '';
  avatarPreview.value = u?.photo || '';
  originalFirstName.value = firstName.value;
  originalLastName.value = lastName.value;
}, { immediate: true });

const dirtyFirstName = computed(() => firstName.value !== originalFirstName.value);
const dirtyLastName = computed(() => lastName.value !== originalLastName.value);

const showChangePassword = ref(false);
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const savingPassword = ref(false);

// pour ne pas autoriser le navigateur a automatiquement remplir les champs de mot de passe, on utilise des noms d'input aléatoires à chaque chargement
const oldPasswordName = 'pwd-old-' + Math.random().toString(36).slice(2);
const newPasswordName = 'pwd-new-' + Math.random().toString(36).slice(2);
const confirmPasswordName = 'pwd-confirm-' + Math.random().toString(36).slice(2);

const oldPwdReadonly = ref(true);
const newPwdReadonly = ref(true);
const confirmPwdReadonly = ref(true);

function unlockOldPassword() {
  oldPwdReadonly.value = false;
  setTimeout(() => {
    const el = document.querySelector(`input[name="${oldPasswordName}"]`);
    if (el) el.focus();
  }, 0);
}

function unlockNewPassword() {
  newPwdReadonly.value = false;
  setTimeout(() => {
    const el = document.querySelector(`input[name="${newPasswordName}"]`);
    if (el) el.focus();
  }, 0);
}

function unlockConfirmPassword() {
  confirmPwdReadonly.value = false;
  setTimeout(() => {
    const el = document.querySelector(`input[name="${confirmPasswordName}"]`);
    if (el) el.focus();
  }, 0);
}

const pwErrors = ref({ old: '', new: '', confirm: '' });

const isValidPassword = (pw) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);

const notificationsEnabled = ref(true);

const sessions = ref([]); 

function getDeviceIcon(deviceType) {
  if (deviceType === 'mobile' || deviceType === 'tablet') return 'phone';
  if (deviceType === 'desktop') return 'desktop';
  return 'laptop'; 
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
  }).format(date);
}

async function loadSessions() {
  try {
    const backendSessions = await userStore.fetchSessions();
  
    sessions.value = backendSessions.map((conn, index) => ({
      id: conn.connexion_id,
      device: conn.device_type === 'mobile' ? 'Mobile' : 'PC / Ordinateur',
      browser: `${conn.browser} ${conn.browser_version}`,
      os: conn.os,
      location: `${conn.ville}, ${conn.pays}`,
      time: index === 0 ? 'Active now' : formatTime(conn.date_action),
      current: index === 0, // On considère la connexion la plus récente (index 0) comme l'actuelle
      icon: getDeviceIcon(conn.device_type),
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des sessions:', error);
  }
}

onMounted(() => {
  loadSessions();
});

const initials = computed(() => {
  const f = firstName.value?.trim()?.[0] || '';
  const l = lastName.value?.trim()?.[0] || '';
  return (f + l).toUpperCase();
});


function triggerFileInput() { fileInput.value?.click(); }

function isObjectUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:');
}

function revokeObjectUrl(url) {
  if (!isObjectUrl(url)) return;
  URL.revokeObjectURL(url);
}

function onFileChange(event) {
  const file = event.target.files?.[0] || null;
  if (file) {
    revokeObjectUrl(tempAvatarPreview.value);
    tempAvatarFile.value = file;
    tempAvatarPreview.value = URL.createObjectURL(file);
    showImageConfirm.value = true;
  }
}

async function confirmImageUpload() {
  if (!tempAvatarFile.value || uploadingAvatar.value) return;

  uploadingAvatar.value = true;

  try {
    const photo = await authStore.uploadProfilePhoto(tempAvatarFile.value);

    revokeObjectUrl(tempAvatarPreview.value);
    avatarPreview.value = photo;
    tempAvatarFile.value = null;
    tempAvatarPreview.value = '';
    showImageConfirm.value = false;

    if (fileInput.value) fileInput.value.value = '';
  } catch (error) {
    console.error(error);
    alert(error?.response?.data?.message || error?.message || 'Failed to upload profile picture');
  } finally {
    uploadingAvatar.value = false;
  }
}

function cancelImageUpload() {
  if (uploadingAvatar.value) return;

  revokeObjectUrl(tempAvatarPreview.value);
  tempAvatarFile.value = null;
  tempAvatarPreview.value = '';
  showImageConfirm.value = false;
  if (fileInput.value) fileInput.value.value = '';
}

function removeImage() {
  revokeObjectUrl(avatarPreview.value);
  avatarPreview.value = '';
}

async function saveFirstName() {
  try {
    await userStore.updateProfile({ firstName: firstName.value, lastName: lastName.value });
    originalFirstName.value = firstName.value;
  } catch (err) {
    console.error(err);
    alert(err?.message || 'Failed to save first name');
    firstName.value = originalFirstName.value;
  }
}

function cancelFirstName() { firstName.value = originalFirstName.value; }

async function saveLastName() {
  try {
    await userStore.updateProfile({ firstName: firstName.value, lastName: lastName.value });
    originalLastName.value = lastName.value;
  } catch (err) {
    console.error(err);
    alert(err?.message || 'Failed to save last name');
    lastName.value = originalLastName.value;
  }
}

function cancelLastName() { lastName.value = originalLastName.value; }

async function submitPasswordChange() {
  pwErrors.value = { old: '', new: '', confirm: '' };
  let hasError = false;
  if (!oldPassword.value) { pwErrors.value.old = 'Please enter your current password'; hasError = true; }
  if (!isValidPassword(newPassword.value)) { pwErrors.value.new = 'Password must be 8+ chars with a letter, number, and special character'; hasError = true; }
  if (newPassword.value !== confirmPassword.value) { pwErrors.value.confirm = 'Passwords do not match'; hasError = true; }
  if (hasError) return;

  savingPassword.value = true;
  try {
    await userStore.changePassword(oldPassword.value, newPassword.value);
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    showChangePassword.value = false;
    // peut etre toast a la place de alert apres
    alert('Password updated successfully');
  } catch (err) {
    console.error(err);
    const msg = err?.response?.data?.error || err?.message || String(err);
    if (msg.toLowerCase().includes('ancienne') || msg.toLowerCase().includes('incorrect')) {
      pwErrors.value.old = msg;
    } else if (msg.toLowerCase().includes('mot de passe') || msg.toLowerCase().includes('password')) {
      pwErrors.value.new = msg;
    } else {
      alert(msg);
    }
  } finally {
    savingPassword.value = false;
  }
}

function revokeSession(id) {
  sessions.value = sessions.value.filter(s => s.id !== id);
}

function logoutAllSessions() {
  sessions.value = sessions.value.filter(s => s.current);
}



async function linkGithubAccount() {
  try {
    await githubStore.connectGithub();
  } catch (error) {
    console.error(error);
    alert('Impossible de se connecter à GitHub. Veuillez réessayer.');
  }
}

const showProForm = ref(false);
const proData = ref({ entreprise: '', poste: '', email_professionnel: '' });
const proLoading = ref(false);

async function submitProRequest() {
  proLoading.value = true;
  try {
    await userStore.requestProfessionnelStatus(proData.value);
    alert('Demande envoyée avec succès !');
    showProForm.value = false;
    proData.value = { entreprise: '', poste: '', email_professionnel: '' };
  } catch (err) {
    alert(err.response?.data?.error || 'Erreur lors de la demande');
  } finally {
    proLoading.value = false;
  }
}

const showDeleteConfirm = ref(false);
const deletePassword = ref('');
const deletingAccount = ref(false);

async function handleDeleteAccount() {
  if (!deletePassword.value) {
    alert('Please enter your password to confirm.');
    return;
  }

  if (confirm('Are you absolutely sure? All your data will be permanently lost.')) {
    deletingAccount.value = true;
    try {
      await userStore.deleteAccount(deletePassword.value);
      alert('Your account has been deleted.');
      window.location.href = '/login'; // Redirect to login
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete account.');
    } finally {
      deletingAccount.value = false;
    }
  }
}

</script>

<template>
  <div class="settings-page">
    <main class="settings-content">
      <div class="page-heading">
        <Settings class="settings-icon" />
        <h1 class="page-title">
          Account Settings
        </h1>
      </div>

      <!-- Profile Picture -->
      <div class="avatar-header">
        <div class="avatar-wrap">
          <div
            class="avatar"
            @click="triggerFileInput"
          >
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="avatar"
            >
            <span
              v-else
              class="avatar-initials"
            >{{ initials }}</span>
          </div>
          <button
            v-if="avatarPreview"
            class="btn-trash"
            aria-label="Remove profile picture"
            @click.stop="removeImage"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
          <transition name="fade">
            <div
              v-if="showImageConfirm"
              class="confirm-card"
            >
              <img
                :src="tempAvatarPreview"
                alt="preview"
                class="confirm-thumb"
              >
              <div class="confirm-actions">
                <button
                  class="btn btn-primary btn-sm"
                  :disabled="uploadingAvatar"
                  @click="confirmImageUpload"
                >
                  {{ uploadingAvatar ? 'Uploading...' : 'Apply' }}
                </button>
                <button
                  class="btn btn-ghost btn-sm"
                  :disabled="uploadingAvatar"
                  @click="cancelImageUpload"
                >
                  Cancel
                </button>
              </div>
            </div>
          </transition>
        </div>
        <div class="avatar-info">
          <p class="avatar-name">
            {{ firstName }} {{ lastName }}
          </p>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          hidden
          @change="onFileChange"
        >
      </div>

      <!-- Personal Information -->
      <section class="card">
        <div class="card-header">
          <div class="card-header-left">
            <svg
              class="card-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            ><path d="M20 21v-2a4 4 0 0 0-3-3.87" /><path d="M4 21v-2a4 4 0 0 1 3-3.87" /><circle
              cx="12"
              cy="7"
              r="4"
            /></svg>
            <span class="card-label">Personal Information</span>
          </div>
        </div>
        <div class="card-body fields-section">
          <div class="field-group">
            <label class="field-label">First Name</label>
            <div class="field-row">
              <input
                v-model="firstName"
                class="field-input"
                type="text"
              >
              <transition name="slide">
                <div
                  v-if="dirtyFirstName"
                  class="field-actions"
                >
                  <button
                    class="btn btn-primary btn-sm"
                    @click="saveFirstName"
                  >
                    Save
                  </button>
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="cancelFirstName"
                  >
                    Cancel
                  </button>
                </div>
              </transition>
            </div>
          </div>

          <div class="field-divider" />

          <div class="field-group">
            <label class="field-label">Last Name</label>
            <div class="field-row">
              <input
                v-model="lastName"
                class="field-input"
                type="text"
              >
              <transition name="slide">
                <div
                  v-if="dirtyLastName"
                  class="field-actions"
                >
                  <button
                    class="btn btn-primary btn-sm"
                    @click="saveLastName"
                  >
                    Save
                  </button>
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="cancelLastName"
                  >
                    Cancel
                  </button>
                </div>
              </transition>
            </div>
          </div>

          <div class="field-divider" />

          <div class="field-group">
            <label class="field-label">Email Address</label>
            <div class="email-display">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="2"
                />
                <path d="M2 7l10 7 10-7" />
              </svg>
              <span>{{ email }}</span>
            </div>
            <p class="field-note">
              Your email address cannot be changed.
            </p>
          </div>
        </div>
      </section>

      <!-- Account Security -->
      <section class="card">
        <div class="card-header">
          <div class="card-header-left">
            <svg
              class="card-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            ><rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
            /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span class="card-label">Account Security</span>
          </div>
        </div>
        <div class="card-body">
          <div class="row-item">
            <div class="row-info">
              <span class="row-label">Password</span>
              <span class="row-sub">Last changed 3 months ago</span>
            </div>
            <button
              v-if="!showChangePassword"
              class="btn btn-ghost btn-sm"
              @click="showChangePassword = true"
            >
              Change password
            </button>
          </div>

          <transition name="expand">
            <div
              v-if="showChangePassword"
              class="pw-form"
            >
              <div class="pw-fields">
                <div class="pw-field">
                  <Input
                    v-model="oldPassword"
                    label="Current Password"
                    type="password"
                    size="sm"
                    placeholder="••••••••"
                    :class="{ 'field-input--error': pwErrors.old }"
                    :disabled="savingPassword"
                    :name="oldPasswordName"
                    autocomplete="off"
                    :readonly="oldPwdReadonly"
                    @focus="unlockOldPassword"
                  />
                  <Error
                    v-if="pwErrors.old"
                    variant="field"
                  >
                    {{ pwErrors.old }}
                  </Error>
                </div>

                <div class="pw-field">
                  <Input
                    v-model="newPassword"
                    label="New Password"
                    type="password"
                    size="sm"
                    placeholder="At least 8 characters"
                    :class="{ 'field-input--error': pwErrors.new }"
                    :disabled="savingPassword"
                    :name="newPasswordName"
                    autocomplete="new-password"
                    :readonly="newPwdReadonly"
                    @focus="unlockNewPassword"
                  />
                  <Error
                    v-if="pwErrors.new"
                    variant="field"
                  >
                    {{ pwErrors.new }}
                  </Error>
                  <PasswordStrengthMeter :password="newPassword" />
                </div>

                <div class="pw-field">
                  <Input
                    v-model="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    size="sm"
                    placeholder="Repeat new password"
                    :class="{ 'field-input--error': pwErrors.confirm }"
                    :disabled="savingPassword"
                    :name="confirmPasswordName"
                    autocomplete="new-password"
                    :readonly="confirmPwdReadonly"
                    @focus="unlockConfirmPassword"
                  />
                  <Error
                    v-if="pwErrors.confirm"
                    variant="field"
                  >
                    {{ pwErrors.confirm }}
                  </Error>
                </div>
              </div>
              <div class="pw-actions">
                <button
                  class="btn btn-ghost btn-sm"
                  @click="showChangePassword = false"
                >
                  Cancel
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  :disabled="savingPassword"
                  @click="submitPasswordChange"
                >
                  <span v-if="savingPassword">Saving...</span>
                  <span v-else>Save Password</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </section>

      <!-- Connected Accounts -->
      <section class="card">
        <div class="card-header">
          <div class="card-header-left">
            <svg
              class="card-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.15c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.61-3.37-1.37-3.37-1.37-.45-1.17-1.11-1.48-1.11-1.48-.91-.63.07-.62.07-.62 1.01.07 1.54 1.05 1.54 1.05.9 1.57 2.36 1.12 2.93.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.13-4.56-5.01 0-1.11.39-2.01 1.03-2.72-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.03A9.35 9.35 0 0112 6.8c.85 0 1.71.11 2.51.32 1.9-1.3 2.74-1.03 2.74-1.03.55 1.41.2 2.45.1 2.71.64.71 1.03 1.61 1.03 2.72 0 3.89-2.34 4.75-4.57 5 .36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .26.18.58.69.48A10.18 10.18 0 0022 12.15C22 6.58 17.52 2 12 2z" />
            </svg>
            <span class="card-label">Connected Accounts</span>
          </div>
        </div>
        <div class="card-body">
          <div class="row-item">
            <div class="row-info">
              <span class="row-label">GitHub</span>
              <span class="row-sub">Connect your GitHub account</span>
            </div>
            <button 
              class="btn btn-ghost btn-sm" 
              :disabled="githubStore.loading"
              @click="linkGithubAccount"
            >
              <span v-if="githubStore.loading">Redirecting...</span>
              <span v-else-if="user?.github">Connected</span>
              <span v-else>Link GitHub</span>
            </button>
          </div>
        </div>
      </section>
      <section class="card" v-if="authStore.user?.role === 'etudiant'">
  <div class="card-header">
    <div class="card-header-left">
      <svg
        class="card-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
      <span class="card-label">Upgrade Account</span>
    </div>
  </div>
  <div class="card-body">
    <div class="row-item" v-if="!showProForm">
      <div class="row-info">
        <span class="row-label">Become a Professional</span>
        <span class="row-sub">Access professional features and networking</span>
      </div>
      <button class="btn btn-ghost btn-sm" @click="showProForm = true">
        Apply Now
      </button>
    </div>

    <div v-else class="pw-form">
      <div class="pw-fields" style="grid-template-columns: 1fr 1fr 1fr;">
        <Input v-model="proData.entreprise" label="Company Name" placeholder="e.g. Google" />
        <Input v-model="proData.poste" label="Job Title" placeholder="e.g. Developer" />
        <Input v-model="proData.email_professionnel" label="Work Email" placeholder="you@company.com" />
      </div>
      <div class="pw-actions">
        <button class="btn btn-ghost btn-sm" @click="showProForm = false">Cancel</button>
        <button class="btn btn-primary btn-sm" :disabled="proLoading" @click="submitProRequest">
          {{ proLoading ? 'Sending...' : 'Send Request' }}
        </button>
      </div>
    </div>
  </div>
</section>

      <!-- Notifications -->
      <section class="card">
        <div class="card-header">
          <div class="card-header-left">
            <svg
              class="card-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            ><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            <span class="card-label">Notifications</span>
          </div>
        </div>
        <div class="card-body">
          <div class="row-item">
            <div class="row-info">
              <span class="row-label">Enable notifications</span>
              <span class="row-sub">Receive updates, alerts and activity summaries</span>
            </div>
            <label class="toggle">
              <input
                v-model="notificationsEnabled"
                type="checkbox"
              >
              <span class="toggle-track" />
              <span class="toggle-thumb" />
            </label>
          </div>
        </div>
      </section>

      <!-- Active Sessions -->
      <section class="card">
        <div class="card-header">
          <div class="card-header-left">
            <svg
              class="card-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            ><rect
              x="2"
              y="3"
              width="20"
              height="14"
              rx="2"
            /><path d="M8 21h8M12 17v4" /></svg>
            <span class="card-label">Active Sessions</span>
          </div>
          <button
            v-if="sessions.filter(s => !s.current).length > 0"
            class="btn btn-ghost btn-sm btn-logout-all"
            @click="logoutAllSessions"
          >
            Log out all other sessions
          </button>
        </div>
        <div class="card-body sessions-body">
          <div
            v-for="(session, index) in sessions"
            :key="session.id"
            class="session-item"
            :class="{ 'session-first': index === 0 }"
          >
            <div class="session-icon-wrap">
              <svg
                v-if="session.icon === 'laptop'"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="3"
                  width="20"
                  height="14"
                  rx="2"
                />
                <path d="M0 21h24" />
              </svg>
              <svg
                v-if="session.icon === 'phone'"
                width="17"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect
                  x="5"
                  y="2"
                  width="14"
                  height="20"
                  rx="2"
                />
                <circle
                  cx="12"
                  cy="18"
                  r="1"
                  fill="currentColor"
                />
              </svg>
              <svg
                v-if="session.icon === 'desktop'"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="3"
                  width="20"
                  height="14"
                  rx="2"
                />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>

            <div class="session-info">
              <div class="session-top">
                <span class="session-device">{{ session.device }}</span>
                <span
                  v-if="session.current"
                  class="badge-current"
                >Current session</span>
              </div>
              <span class="session-meta">{{ session.browser }} · {{ session.os }}</span>
              <span class="session-meta">{{ session.location }} · {{ session.time }}</span>
            </div>

            <button
              v-if="!session.current"
              class="btn btn-ghost btn-sm btn-logout-session"
              @click="revokeSession(session.id)"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
              /></svg>
              Log out
            </button>
          </div>

          <p
            v-if="sessions.filter(s => !s.current).length === 0 && sessions.length > 0"
            class="sessions-note"
          >
            No other active sessions.
          </p>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="card card-danger">
        <div class="card-header">
          <div class="card-header-left">
            <svg class="card-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94A2 2 0 0 0 22.18 18L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <span class="card-label card-label-danger">Danger Zone</span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="row-item" v-if="!showDeleteConfirm">
            <div class="row-info">
              <span class="row-label danger-title">Delete my account</span>
              <span class="row-sub">Permanently remove your account and all associated data. This action cannot be undone.</span>
            </div>
            <button class="btn btn-danger btn-sm" @click="showDeleteConfirm = true">
              Delete Account
            </button>
          </div>

          <transition name="expand">
            <div v-if="showDeleteConfirm" class="pw-form" style="margin-top: 0; border-top: none; padding-top: 0;">
              <div class="row-info" style="margin-bottom: 1rem;">
                <span class="row-label danger-title">Confirm Account Deletion</span>
                <span class="row-sub">Please enter your password to verify your identity.</span>
              </div>
              <div class="pw-fields" style="grid-template-columns: 1fr;">
                <Input 
                  v-model="deletePassword" 
                  label="Password" 
                  type="password" 
                  placeholder="Enter your current password" 
                  :disabled="deletingAccount"
                />
              </div>
              <div class="pw-actions">
                <button class="btn btn-ghost btn-sm" @click="showDeleteConfirm = false">Cancel</button>
                <button class="btn btn-danger btn-sm" :disabled="deletingAccount" @click="handleDeleteAccount">
                  {{ deletingAccount ? 'Deleting...' : 'Permanently Delete' }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.settings-page {
  background: var(--color-background, #f0ede8);
  min-height: 100vh;
  padding: 2.5rem 2rem;
}

.settings-content {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-primary, #1a1a1a);
  margin: 0;
  line-height: 1.1;
}

.page-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.settings-icon {
  color: var(--color-muted, #999);
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateY(2px);
}


.card {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  overflow: hidden;
}

.card-danger {
  border-color: rgba(220,38,38,0.18);
}

.card-header {
  padding: 1.25rem 1.75rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--color-muted, #999);
}

.card-label-danger { color: #dc2626; }

.card-body { padding: 1rem 1.75rem 1.5rem; }

.avatar-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem 0 0.25rem;
  position: relative;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  border: 3px solid rgba(255,255,255,0.7);
  box-shadow: 0 0 0 1.5px rgba(59,130,246,0.18);
  transition: box-shadow 0.2s;
}

.avatar:hover { box-shadow: 0 0 0 2.5px rgba(59,130,246,0.35); }
.avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-initials {
  font-size: 2.6rem;
  font-weight: 600;
  color: #1d4ed8;
}

.btn-trash {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid rgba(220,38,38,0.25);
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}

.btn-trash:hover {
  background: rgba(220,38,38,0.07);
  border-color: rgba(220,38,38,0.45);
}

.avatar-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.avatar-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-primary, #1a1a1a);
}

.confirm-card {
  position: absolute;
  left: calc(100% + 12px);
  right: auto;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  z-index: 30;
}

.confirm-thumb {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
}

.confirm-actions { display: flex; flex-direction: column; gap: 0.4rem; }


.fields-section {
  display: flex;
  flex-direction: column;
  padding-top: 1.1rem;
}

.field-group { padding: 0.8rem 0; }

.field-divider {
  height: 1px;
  background: rgba(0,0,0,0.07);
}

.field-label {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-muted, #aaa);
  margin-bottom: 0.5rem;
}

.field-row { display: flex; align-items: center; gap: 0.75rem; }

.field-input {
  flex: 1;
  height: 40px;
  padding: 0 0.85rem;
  font-size: 0.9rem;
  color: var(--color-primary, #1a1a1a);
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 9px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}

.field-input:focus {
  border-color: rgba(59,130,246,0.45);
  background: rgba(255,255,255,0.9);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
}

.field-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }

.email-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-primary, #1a1a1a);
  padding: 0.15rem 0;
}

.email-display svg { color: #aaa; flex-shrink: 0; }

.field-note {
  font-size: 0.72rem;
  color: var(--color-muted, #bbb);
  margin-top: 0.35rem;
}

.row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0;
}

.row-info { display: flex; flex-direction: column; gap: 0.15rem; }

.row-label {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--color-primary, #1a1a1a);
}

.row-sub {
  font-size: 0.78rem;
  color: var(--color-muted, #999);
}

.pw-form {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.pw-fields {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.pw-field .field-input {
  min-width: 220px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.card-icon {
  color: var(--color-muted, #999);
  flex-shrink: 0;
}

.input.field-input--error input {
  border-color: rgba(220,38,38,0.5) !important;
  background: rgba(220,38,38,0.03) !important;
}
.input.field-input--error input:focus {
  border-color: rgba(220,38,38,0.6) !important;
  box-shadow: 0 0 0 3px rgba(220,38,38,0.08) !important;
}

.pw-field { display: flex; flex-direction: column; gap: 0.35rem; }

.field-input--error {
  border-color: rgba(220,38,38,0.5) !important;
  background: rgba(220,38,38,0.03) !important;
}

.field-input--error:focus {
  border-color: rgba(220,38,38,0.6) !important;
  box-shadow: 0 0 0 3px rgba(220,38,38,0.08) !important;
}

.field-error {
  font-size: 0.71rem;
  color: #dc2626;
  margin-top: 2px;
}

.strength-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 5px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: rgba(0,0,0,0.1);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s, background 0.25s;
}

.strength-label {
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 38px;
  text-align: right;
  transition: color 0.25s;
}

.pw-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.toggle {
  position: relative;
  width: 42px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle input { opacity: 0; width: 0; height: 0; position: absolute; }

.toggle-track {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(0,0,0,0.18);
  transition: background 0.2s;
}

.toggle input:checked + .toggle-track { background: #22c55e; }

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 0.2s;
  pointer-events: none;
}

.toggle input:checked ~ .toggle-thumb { transform: translateX(18px); }


.sessions-body {
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 0;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.session-first { border-top: none; }

.session-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(0,0,0,0.07);
  color: #666;
}

.session-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.session-top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.session-device {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-primary, #1a1a1a);
}

.badge-current {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34,197,94,0.15);
  color: #16a34a;
}

.session-meta {
  font-size: 0.75rem;
  color: var(--color-muted, #999);
  line-height: 1.55;
}

.btn-logout-session {
  color: #dc2626;
  border-color: rgba(220,38,38,0.2);
  flex-shrink: 0;
}

.btn-logout-session:hover { background: rgba(220,38,38,0.06); }

.btn-logout-all {
  font-size: 0.75rem;
}

.sessions-note {
  font-size: 0.82rem;
  color: var(--color-muted, #aaa);
  text-align: center;
  padding: 0.75rem 0;
}


.danger-title { color: #dc2626; }


.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: inherit;
  font-weight: 500;
  border-radius: 9px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  white-space: nowrap;
}

.btn-sm {
  font-size: 0.78rem;
  padding: 0.38rem 0.9rem;
  height: 32px;
}

.btn-ghost {
  background: rgba(255,255,255,0.5);
  border-color: rgba(0,0,0,0.12);
  color: var(--color-primary, #1a1a1a);
}

.btn-ghost:hover { background: rgba(255,255,255,0.8); }

.btn-primary {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
}

.btn-primary:hover { opacity: 0.82; }

.btn-danger {
  background: transparent;
  border-color: rgba(220,38,38,0.3);
  color: #dc2626;
}

.btn-danger:hover { background: rgba(220,38,38,0.07); }


.fade-enter-active, .fade-leave-active { transition: opacity 0.18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: opacity 0.15s, transform 0.15s; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateX(-6px); }

.expand-enter-active, .expand-leave-active { transition: opacity 0.2s; }
.expand-enter-from, .expand-leave-to { opacity: 0; }

@media (max-width: 700px) {
  .settings-page { padding: 1.25rem 1rem; }
  .pw-fields { grid-template-columns: 1fr; }
  .confirm-card { position: static; transform: none; margin-top: 0.75rem; }

  .card-danger .row-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }
  .card-danger .row-info { width: 100%; }
  .card-danger .btn-danger {
    align-self: stretch;
    width: 100%;
    text-align: center;
  }
  .card-danger .row-sub {
    font-size: 0.75rem;
    line-height: 1.35;
  }
}
</style>