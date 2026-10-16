<script setup lang="ts">
import { useQRCode } from "@vueuse/integrations/useQRCode";
import { ref } from "vue";

const props = defineProps<{
  text: string;
}>();

const qrcode = useQRCode(props.text);
const dialog = ref(true);
</script>

<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card title="Scan the QrCode to download  your file">
      <v-card-text>
        <img :src="qrcode" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
