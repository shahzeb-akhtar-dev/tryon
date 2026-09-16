<script setup lang="ts">
useSeoMeta({
  title: 'Terms of Service | TryOn',
  description: 'Read the terms and conditions for using TryOn.',
})
</script>

<template>
  <main class="min-h-screen">
    <div class="max-w-[800px] mx-auto px-5 py-8">
      <h1 class="text-3xl text-black font-primary font-bold mb-6">Terms of Service</h1>
      
      <div class="prose prose-sm max-w-none">
        <p class="text-neutral font-primary mb-4">
          Last updated: {{ new Date().toLocaleDateString() }}
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p class="text-neutral font-primary mb-4">
          By accessing and using TryOn, you accept and agree to be bound by the terms and provisions of this agreement.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">2. Description of Service</h2>
        <p class="text-neutral font-primary mb-4">
          TryOn provides AI-powered virtual try-on services that allow users to visualize how clothing items will look on them.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">3. User Accounts</h2>
        <p class="text-neutral font-primary mb-4">
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">4. Acceptable Use</h2>
        <p class="text-neutral font-primary mb-4">
          You agree not to use the service to:
        </p>
        <ul class="list-disc pl-6 text-neutral font-primary mb-4">
          <li>Upload inappropriate or offensive content</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on the intellectual property rights of others</li>
          <li>Attempt to gain unauthorized access to the service</li>
        </ul>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">5. Intellectual Property</h2>
        <p class="text-neutral font-primary mb-4">
          You retain ownership of the photos you upload. By using our service, you grant us a license to process and store your images for the purpose of providing virtual try-on services.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">6. Disclaimer of Warranties</h2>
        <p class="text-neutral font-primary mb-4">
          The service is provided "as is" without warranties of any kind, either express or implied.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">7. Limitation of Liability</h2>
        <p class="text-neutral font-primary mb-4">
          In no event shall TryOn be liable for any indirect, incidental, special, consequential, or punitive damages.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">8. Changes to Terms</h2>
        <p class="text-neutral font-primary mb-4">
          We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">9. Contact Information</h2>
        <p class="text-neutral font-primary mb-4">
          For questions about these Terms, please contact us.
        </p>
      </div>
    </div>
  </main>
</template>
