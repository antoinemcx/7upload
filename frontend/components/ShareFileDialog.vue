<script setup lang="ts">
import { useQRCode } from "@vueuse/integrations/useQRCode";
import { computed, ref } from "vue";

const props = defineProps<{
  downloadUrl: string;
}>();

const qrcode = useQRCode(computed(() => props.downloadUrl));
const dialog = defineModel<boolean>("open", {
  default: false,
});
const copied = ref(false);
const copyError = ref(false);

async function copyDownloadUrl() {
  try {
    await navigator.clipboard.writeText(props.downloadUrl);
    copied.value = true;
    copyError.value = false;
  } catch {
    copied.value = false;
    copyError.value = true;
  }
}
</script>

<template>
  <VDialog v-model="dialog" max-width="360">
    <VCard>
      <VCardTitle class="text-center">Partager le fichier</VCardTitle>

      <VCardText class="text-center">
        <VCardTitle>Avec un QR Code</VCardTitle>
        <VImg
          :src="qrcode"
          width="210"
          height="210"
          alt="Code QR pour télécharger le fichier"
          class="mx-auto"
        />
      </VCardText>

      <VCardText>
        <VCardSubtitle class="text-center text-uppercase">ou</VCardSubtitle>
        <VCardTitle class="text-center">En copiant le lien</VCardTitle>
        <VTextField
          :model-value="downloadUrl"
          label="Lien de téléchargement"
          readonly
          hide-details
        >
          <template #append-inner>
            <VBtn
              icon="mdi-content-copy"
              variant="text"
              aria-label="Copier le lien de téléchargement"
              @click="copyDownloadUrl"
            />
          </template>
        </VTextField>
        <VAlert v-if="copied" type="success" variant="tonal" class="mt-3">
          Lien copié.
        </VAlert>
        <VAlert v-if="copyError" type="error" variant="tonal" class="mt-3">
          Impossible de copier le lien.
        </VAlert>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn @click="dialog = false">Fermer</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
