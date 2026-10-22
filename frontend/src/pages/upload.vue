<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { useRules, type SubmitEventPromise } from "vuetify";
import ShareFileDialog from "../../components/ShareFileDialog.vue";

const rules = useRules();

const isValid = ref(false);

const files = shallowRef<File[]>([]);
const retention = ref<number>(604_800);
const autodestruct = ref<boolean>(false);
const password = ref<string>();

// temp
const msg = ref("");
const downloadUrl = ref("");
const showShareDialog = ref(false);

async function submit(e: SubmitEventPromise) {
  if (!(await e).valid) return;

  const form = new FormData();
  for (const file of files.value) {
    form.append("files", file);
  }
  form.append("retention", retention.value.toFixed());
  form.append("autodestruct", autodestruct.value.toString());
  if (password.value) {
    form.append("password", password.value);
  }

  const res = await fetch(import.meta.env.VITE_API_URL + "/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    msg.value = `Réponse du serveur non valide : ${res.statusText} (${res.status})`;
    return;
  }

  const body: { id: string } = await res.json();

  msg.value = `Fichier envoyé avec succès : ID ${body.id}`;

  downloadUrl.value = `${window.location.origin}/download/${body.id}`;
  showShareDialog.value = true;
}
</script>

<template>
  <VContainer max-width="800">
    <h1 class="font-weight-bold mb-4 mt-3">Partage de fichiers</h1>

    <VCard flat border>
      <VCardText>
        <VForm v-model="isValid" @submit.prevent="submit">
          <VFileUpload
            v-model="files"
            :rules="[rules.required()]"
            class="mb-4"
            multiple
          />

          <VDivider class="mb-4" />

          <p class="text-subtitle-2 text-medium-emphasis mb-3">Options</p>

          <VNumberInput
            v-model="retention"
            suffix="s"
            label="Durée de rétention"
            :rules="[rules.required(), rules.integer()]"
            class="mb-2"
          />
          <VSwitch v-model="autodestruct" label="Auto-destruction après téléchargement" />
          <VTextField
            v-model="password"
            type="password"
            label="Mot de passe (optionnel)"
            class="mb-4"
          />

          <VBtn
            type="submit"
            :disabled="!isValid"
            block
            size="large"
            :color="isValid ? 'primary' : undefined"
          >
            Envoyer
          </VBtn>
        </VForm>
      </VCardText>
    </VCard>

    <VAlert v-if="msg" class="mt-4" type="info" variant="tonal">
      {{ msg }}
    </VAlert>
    <ShareFileDialog
      v-if="downloadUrl"
      v-model:open="showShareDialog"
      :download-url="downloadUrl"
      class="mt-4"
    />
  </VContainer>
</template>
