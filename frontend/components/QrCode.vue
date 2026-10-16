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
  <v-dialog v-model="dialog" max-width="360">
    <v-card>
      <v-card-title class="text-center"> Scan to download file </v-card-title>

      <v-card-text class="d-flex justify-center">
        <img :src="qrcode" width="210" height="210" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
