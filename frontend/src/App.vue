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
      <VToolbar></VToolbar>
      <VMain>
        <RouterView />
      </VMain>
    </VDefaultsProvider>
  </VApp>
</template>
