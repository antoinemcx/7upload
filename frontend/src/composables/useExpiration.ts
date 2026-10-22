import { computed, ref } from "vue";

/**
 * File expiration composable for managing expiration dates input
 * and times of files.
 */
export function useExpiration() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  if (maxDate.getMonth() !== today.getMonth()) {
    maxDate.setDate(0);
  }
  const endOfMaxDate = new Date(maxDate);
  endOfMaxDate.setHours(23, 59, 59, 999);

  // Default expiration is set to one hour from now
  const defaultExpiration = new Date(Date.now() + 60 * 60 * 1000);
  const defaultExpirationHours = defaultExpiration.getHours().toString().padStart(2, "0");
  const defaultExpirationMinutes = defaultExpiration
    .getMinutes()
    .toString()
    .padStart(2, "0");
  const expirationDate = ref<Date | null>(defaultExpiration);
  const expirationTime = ref<string | null>(
    `${defaultExpirationHours}:${defaultExpirationMinutes}`,
  );

  // Format the expiration date for display purposes
  const formattedDate = computed(() =>
    expirationDate.value
      ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
          expirationDate.value,
        )
      : "Choisir une date",
  );
  const expirationTimestamp = computed(() => {
    if (
      !expirationDate.value ||
      !expirationTime.value ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(expirationTime.value)
    ) {
      return NaN;
    }
    const expiration = new Date(expirationDate.value);
    const hours = Number(expirationTime.value.slice(0, 2));
    const minutes = Number(expirationTime.value.slice(3, 5));
    expiration.setHours(hours, minutes, 0, 0);
    return expiration.getTime();
  });

  /** Validates the expiration timestamp. */
  function validateExpiration(value: number) {
    if (!Number.isFinite(value)) return "Choisissez une date et une heure d'expiration.";
    if (value <= Date.now()) return "L'expiration doit être dans le futur.";
    return value <= endOfMaxDate.getTime() || "La date ne peut pas dépasser un an.";
  }

  /** @returns retention time in seconds until expiration. */
  function getRetentionSeconds() {
    return Math.ceil((expirationTimestamp.value - Date.now()) / 1000);
  }

  return {
    today,
    maxDate,
    expirationDate,
    expirationTime,
    formattedDate,
    expirationTimestamp,
    validateExpiration,
    getRetentionSeconds,
  };
}
