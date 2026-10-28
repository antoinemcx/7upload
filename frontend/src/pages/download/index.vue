<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const code = ref("");
const error = ref("");

/**
 * Extract the UUID from a string, which can be:
 * - directly a UUID
 * - a download URL containing a UUID.
 */
function extractUuid(value: string) {
  const input = value.trim();
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (uuidPattern.test(input)) return input;

  try {
    const url = new URL(input);
    const parts = url.pathname.split("/").filter(Boolean);
    const downloadIndex = parts.indexOf("download");
    const uuid = downloadIndex === -1 ? "" : parts[downloadIndex + 1];
    return uuid && uuidPattern.test(uuid) ? uuid : undefined;
  } catch {
    return undefined;
  }
}

function openDownload() {
  const uuid = extractUuid(code.value);
  if (!uuid) {
    error.value = "Saisissez un code de dossier valide.";
    return;
  }

  router.push(`/download/${uuid}`);
}
</script>

<template>
  <VContainer max-width="600">
    <VCard class="pa-4">
      <VCardTitle>Accéder à un partage</VCardTitle>
      <VCardText>
        <p class="mb-4">Saisissez le code du partage.</p>
        <VTextField
          v-model="code"
          label="Code de téléchargement"
          :error-messages="error"
          @keyup.enter="openDownload"
        />
        <VBtn block color="primary" @click="openDownload">Accéder au partage</VBtn>
      </VCardText>
    </VCard>
  </VContainer>
</template>
