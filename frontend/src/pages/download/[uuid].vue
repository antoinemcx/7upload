<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const suspiciousExtensions = new Set([
  ".bat",
  ".cmd",
  ".com",
  ".exe",
  ".js",
  ".msi",
  ".ps1",
  ".scr",
  ".vbs",
]);

function isSuspiciousFile(name: string) {
  const extension = name.slice(name.lastIndexOf(".")).toLowerCase();
  return suspiciousExtensions.has(extension);
}

type FileInfo = {
  name: string;
  mimeType: string;
  remaining: number;
  autodestruct: boolean;
};

const route = useRoute();
const info = ref<FileInfo>();
const password = ref("");
const passwordRequired = ref(false);
const protectedExtension = ref("");
const error = ref("");
const loading = ref(true);
const downloading = ref(false);
const confirmationOpen = ref(false);

const uuid = computed(() => ("uuid" in route.params ? String(route.params.uuid) : ""));
const apiUrl = computed(() => `${import.meta.env.VITE_API_URL}/files/${uuid.value}`);
const suspicious = computed(
  () => info.value !== undefined && isSuspiciousFile(info.value.name),
);

/** Load the file metadata information from the API. */
async function loadInfo() {
  loading.value = true;
  error.value = "";
  const headers: HeadersInit = {};
  if (password.value) {
    headers["X-File-Password"] = password.value;
  }

  // Fetch the file info from the API with the password header if provided
  const response = await fetch(`${apiUrl.value}/info`, { headers });
  if (response.status === 401) {
    const body = (await response.json()) as { extension?: string };
    protectedExtension.value = body.extension ?? "";
    passwordRequired.value = true;
    if (password.value) error.value = "Mot de passe incorrect.";
    loading.value = false;
    return;
  }
  if (response.status === 410) {
    error.value = "Le fichier a expiré et a été supprimé.";
    loading.value = false;
    return;
  }
  if (!response.ok) {
    error.value =
      response.status === 404
        ? "Fichier introuvable."
        : "Impossible de charger le fichier.";
    loading.value = false;
    return;
  }

  // Parse the file info from the response
  info.value = (await response.json()) as FileInfo;
  passwordRequired.value = false;
  loading.value = false;
}

/** Download the file with confirmation if needed. */
async function download() {
  if (suspicious.value) {
    confirmationOpen.value = true;
    return;
  }
  await startDownload();
}

/** Start the download process. */
async function startDownload() {
  downloading.value = true;

  // Fetch the file from the API with the password header if provided
  const headers: HeadersInit = {};
  if (password.value) {
    headers["X-File-Password"] = password.value;
  }
  const response = await fetch(apiUrl.value, { headers });
  if (response.status === 410) {
    error.value = "Le fichier a expiré et a été supprimé.";
    downloading.value = false;
    return;
  }
  if (!response.ok) {
    error.value = "Le téléchargement a échoué.";
    downloading.value = false;
    return;
  }

  // Create a temporary link to download the file
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = info.value?.name ?? "fichier";
  link.click();
  URL.revokeObjectURL(link.href);
  downloading.value = false;
}

/** Format the remaining time in seconds to a human-readable string. */
function formatRemaining(seconds: number) {
  if (seconds < 60) {
    return `${seconds} seconde${seconds > 1 ? "s" : ""}`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} heure${hours > 1 ? "s" : ""}`;
  }

  const days = Math.floor(hours / 24);
  return `${days} jour${days > 1 ? "s" : ""}`;
}

// Load the file info when the component is mounted
onMounted(loadInfo);
</script>

<template>
  <VContainer max-width="800">
    <VCard v-if="loading" class="pa-6 text-center">Chargement...</VCard>
    <VCard v-else-if="error && !passwordRequired" class="pa-6">
      <VAlert type="error" variant="tonal">{{ error }}</VAlert>
    </VCard>
    <VCard v-else-if="passwordRequired" class="pa-6">
      <VCardTitle>Fichier protégé</VCardTitle>
      <VCardText>
        <p class="mb-4">
          Saisissez le mot de passe pour afficher les informations du fichier.
        </p>
        <p v-if="protectedExtension" class="mb-4">Extension : {{ protectedExtension }}</p>
        <VTextField
          v-model="password"
          label="Mot de passe"
          type="password"
          :error-messages="error"
          @keyup.enter="loadInfo"
        />
        <VBtn block color="primary" @click="loadInfo">Valider</VBtn>
      </VCardText>
    </VCard>

    <VCard v-else-if="info" class="pa-6">
      <VCardTitle>{{ info.name }}</VCardTitle>
      <VCardText>
        <p>Type : {{ info.mimeType }}</p>
        <p v-if="info.autodestruct">Le fichier sera supprimé après téléchargement.</p>
        <p v-else>Durée restante : {{ formatRemaining(info.remaining) }}</p>
      </VCardText>
      <VCardActions>
        <VBtn
          block
          color="primary"
          variant="flat"
          :loading="downloading"
          @click="download"
        >
          Télécharger
        </VBtn>
      </VCardActions>
    </VCard>

    <VDialog v-model="confirmationOpen" max-width="500">
      <VCard>
        <VCardTitle>Attention</VCardTitle>
        <VCardText>
          Ce fichier est un exécutable et peut être dangereux. Voulez-vous continuer ?
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="confirmationOpen = false">Annuler</VBtn>
          <VBtn
            color="error"
            @click="
              confirmationOpen = false;
              startDownload();
            "
          >
            Télécharger
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>
