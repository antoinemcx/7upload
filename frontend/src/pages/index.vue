<script setup lang="ts">
const steps = [
  {
    title: "Envoyez un ou plusieurs fichiers",
    description:
      "Sélectionnez un ou plusieurs fichiers, choisissez une date d’expiration et ajoutez un mot de passe si besoin.",
  },
  {
    title: "Partagez le lien",
    description: "Copiez le lien de téléchargement ou partagez son QR code.",
  },
  {
    title: "Votre destinataire le récupère",
    description: "Le fichier est accessible jusqu’à son expiration, ou une seule fois.",
  },
];

const faq = [
  {
    question: "Mes fichiers sont-ils compressés ?",
    answer:
      "Oui. Les fichiers sont compressés pour leur stockage sur le serveur, puis décompressés lors du téléchargement. Vous récupérez le contenu d’origine.",
  },
  {
    question: "Comment fonctionne le chiffrement par mot de passe ?",
    answer:
      "Si vous définissez un mot de passe, le fichier est chiffré côté serveur avec AES-256-GCM. Une clé est dérivée du mot de passe avec scrypt, et un sel et un vecteur d’initialisation aléatoires sont utilisés. Sans mot de passe, le fichier n’est pas chiffré par l’application. Le chiffrement n’est donc pas de bout en bout.",
  },
  {
    question: "Combien de temps le fichier reste-t-il disponible ?",
    answer:
      "Vous choisissez sa date et son heure d’expiration lors de l’envoi. Une fois ce délai écoulé, le fichier n’est plus disponible.",
  },
  {
    question: "Que fait l’option d’auto-destruction ?",
    answer:
      "Lorsqu’elle est activée, le fichier et ses métadonnées sont supprimés après un téléchargement réussi. Sinon, le fichier reste disponible jusqu’à son expiration.",
  },
  {
    question: "Qui peut télécharger mon fichier ?",
    answer:
      "Toute personne qui possède le lien peut tenter d’y accéder. Ajoutez un mot de passe si vous souhaitez protéger le téléchargement et partagez ce mot de passe séparément du lien.",
  },
];
</script>

<template>
  <VContainer class="py-8 py-md-12" max-width="900">
    <header class="mb-10">
      <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">
        Partagez vos fichiers simplement
      </h1>
      <p class="text-body-1 text-medium-emphasis">
        Envoyez un fichier, choisissez sa durée de disponibilité, puis partagez le lien.
      </p>
    </header>

    <section aria-labelledby="how-title" class="mb-10">
      <h2 id="how-title" class="text-h5 font-weight-bold mb-4">Comment ça marche ?</h2>
      <VRow>
        <VCol v-for="(step, index) in steps" :key="step.title" cols="12" md="4">
          <VCard class="pa-4 h-100" border flat>
            <p class="text-caption text-medium-emphasis mb-2">Étape {{ index + 1 }}</p>
            <h3 class="text-subtitle-1 font-weight-bold mb-2">
              {{ step.title }}
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              {{ step.description }}
            </p>
          </VCard>
        </VCol>
      </VRow>
    </section>

    <section aria-labelledby="faq-title">
      <h2 id="faq-title" class="text-h5 font-weight-bold mb-4">Questions fréquentes</h2>
      <VExpansionPanels variant="accordion">
        <VExpansionPanel v-for="item in faq" :key="item.question" :title="item.question">
          <VExpansionPanelText>{{ item.answer }}</VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </section>

    <VCard class="mt-10 pa-6" border flat>
      <h2 class="text-h5 font-weight-bold">Que souhaitez-vous faire ?</h2>
      <p class="text-body-2 text-medium-emphasis mt-2">
        Partagez un fichier ou accédez à un fichier que l’on vous a envoyé.
      </p>
      <div class="d-flex flex-wrap ga-3 mt-5">
        <VBtn color="primary" to="/upload">Partager un fichier</VBtn>
        <VBtn to="/download" variant="outlined"> Télécharger un fichier </VBtn>
      </div>
    </VCard>
  </VContainer>
</template>
