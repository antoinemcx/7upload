<script setup lang="ts">
import { useQRCode } from "@vueuse/integrations/useQRCode";
import { computed } from "vue";

const props = defineProps<{
  text: string;
}>();

const qrcode = useQRCode(computed(() => props.text));
const dialog = defineModel<boolean>("open", {
  default: false,
});
</script>

<template>
  <VDialog v-model="dialog" max-width="360">
    <VCard>
      <VCardTitle class="text-center"> Scan to download file </VCardTitle>

      <VCardText class="d-flex justify-center">
        <img :src="qrcode" width="210" height="210" />
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn @click="dialog = false"> Close </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
