<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  min: Date;
  max: Date;
  formattedDate: string;
}>();

const date = defineModel<Date | null>("date", { required: true });
const time = defineModel<string | null>("time", { required: true });
const dateMenu = ref(false);
</script>

<template>
  <div class="expiration-fields">
    <VMenu v-model="dateMenu" :close-on-content-click="false" location="bottom start">
      <template #activator="{ props }">
        <VBtn
          v-bind="props"
          variant="outlined"
          height="56"
          prepend-icon="mdi-calendar-outline"
          class="expiration-date"
          :aria-label="`Date d'expiration : ${formattedDate}`"
        >
          <span class="text-left">
            <span class="d-block text-caption text-medium-emphasis">
              Date d'expiration
            </span>
            <span class="d-block">{{ formattedDate }}</span>
          </span>
        </VBtn>
      </template>
      <VDatePicker
        v-model="date"
        :min="min"
        :max="max"
        :first-day-of-week="1"
        hide-header
        @update:model-value="dateMenu = false"
      />
    </VMenu>

    <VTextField
      v-model="time"
      type="time"
      step="60"
      label="Heure d'expiration"
      prepend-inner-icon="mdi-clock-outline"
      variant="outlined"
      hide-details
      class="expiration-time"
    />
  </div>
</template>

<style scoped>
.expiration-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
}

.expiration-date,
.expiration-time {
  flex: 1 1 240px;
  min-width: 0;
}

.expiration-date {
  justify-content: flex-start;
  text-transform: none;
  letter-spacing: normal;
  border-color: color-mix(in srgb, currentColor 38%, transparent);
}

.expiration-time :deep(.v-field__input) {
  height: 56px;
}
</style>
