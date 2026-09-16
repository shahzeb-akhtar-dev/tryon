<script setup lang="ts">
useSeoMeta({
  title: 'Privacy Policy | TryOn',
  description: 'Learn about how TryOn handles your data and privacy.',
})
</script>

<template>
  <main class="min-h-screen">
    <div class="max-w-[800px] mx-auto px-5 py-8">
      <h1 class="text-3xl text-black font-primary font-bold mb-6">Privacy Policy</h1>
      
      <div class="prose prose-sm max-w-none">
        <p class="text-neutral font-primary mb-4">
          Last updated: {{ new Date().toLocaleDateString() }}
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">1. Information We Collect</h2>
        <p class="text-neutral font-primary mb-4">
          We collect information you provide directly to us, including:
        </p>
        <ul class="list-disc pl-6 text-neutral font-primary mb-4">
          <li>Account information (email address, password)</li>
          <li>Photos you upload for virtual try-on</li>
          <li>Garment images you upload</li>
          <li>Usage data and analytics</li>
        </ul>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">2. How We Use Your Information</h2>
        <p class="text-neutral font-primary mb-4">
          We use the information we collect to:
        </p>
        <ul class="list-disc pl-6 text-neutral font-primary mb-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Process virtual try-on requests</li>
          <li>Send technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
        </ul>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">3. Data Storage</h2>
        <p class="text-neutral font-primary mb-4">
          Your photos and try-on results are stored securely in Firebase Storage. We retain your data only as long as necessary to provide our services.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">4. Data Sharing</h2>
        <p class="text-neutral font-primary mb-4">
          We do not sell, trade, or otherwise transfer your personal information to outside parties. Your photos are processed by AI services solely for generating try-on results.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">5. Security</h2>
        <p class="text-neutral font-primary mb-4">
          We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2 class="text-xl text-black font-primary font-bold mt-6 mb-3">6. Contact Us</h2>
        <p class="text-neutral font-primary mb-4">
          If you have any questions about this Privacy Policy, please contact us.
        </p>
      </div>
    </div>
  </main>
</template>
