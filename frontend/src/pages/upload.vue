<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { useRules, type SubmitEventPromise } from "vuetify";

const rules = useRules();

const isValid = ref(false);

const files = shallowRef<File[]>([]);
const retention = ref<number>(604_800);
const autodestruct = ref<boolean>(false);
const password = ref<string>();

// temp
const msg = ref("");

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
}
</script>

<template>
  <VContainer>
    <VForm v-model="isValid" @submit.prevent="submit">
      <VFileUpload v-model="files" :rules="[rules.required()]" />
      <VNumberInput
        v-model="retention"
        suffix="s"
        label="Rétention"
        :rules="[rules.required(), rules.integer()]"
      />
      <VSwitch v-model="autodestruct" label="Auto-destruction" />
      <VTextField v-model="password" type="password" label="Mot de passe" />
      <VBtn
        type="submit"
        :disabled="!isValid"
        block
        size="x-large"
        :color="isValid ? 'tertiary' : undefined"
      >
        Envoyer
      </VBtn>
    </VForm>
    <pre>{{ msg }}</pre>
  </VContainer>
</template>

<style scoped></style>
