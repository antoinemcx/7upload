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
          <RouterLink v-slot="{ navigate }" to="/" custom>
            <VBtn variant="text" @click="navigate">Accueil</VBtn>
          </RouterLink>
          <RouterLink v-slot="{ navigate }" to="/upload" custom>
            <VBtn variant="text" @click="navigate">Partage de fichiers</VBtn>
          </RouterLink>
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
