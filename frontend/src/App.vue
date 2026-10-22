<script setup lang="ts">
const inputDefaults = {
  variant: "outlined",
};

const defaults = {
  VTextField: inputDefaults,
  VNumberInput: inputDefaults,
  VSwitch: {
    inset: "material",
  },
};
</script>

<template>
  <VApp>
    <VDefaultsProvider :defaults>
      <VAppBar flat border="b">
        <div class="d-flex align-center px-4 ga-2">
          <RouterLink to="/" class="logo-link">
            <span class="logo-text">7Upload</span>
          </RouterLink>
          <VBtn variant="text" to="/">Accueil</VBtn>
          <VBtn variant="text" to="/upload">Partage de fichiers</VBtn>
          <VBtn variant="text" to="/download">Télécharger un fichier</VBtn>
        </div>
      </VAppBar>

      <VMain>
        <RouterView />
      </VMain>
    </VDefaultsProvider>
  </VApp>
</template>

<style scoped>
.logo-link {
  text-decoration: none;
  margin-right: 1rem;
}

.logo-text {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  font-size: 1.25rem;
}
</style>
