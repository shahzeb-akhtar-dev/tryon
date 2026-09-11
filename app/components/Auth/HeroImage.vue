<template>
  <div class="absolute inset-0 z-0">
    <NuxtImg
      src="/images/login-hero.png"
      alt="Fashion model virtual try-on"
      class="w-full h-full object-cover  object-[90%_50%] lg:object-center"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/10" />

    <div class="absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-12">
      <div class="flex items-start gap-3">
        <div class="flex flex-col items-start">
          <div class="flex items-center gap-2">
            <Icon icon="ic:outline-checkroom" class="w-8 h-8 text-primary" />
            <span class="text-3xl font-primary font-bold tracking-tight">
              <span class="text-black">Try</span><span class="text-primary">On</span>
            </span>
          </div>
          <p class="text-[10px] text-neutral font-primary tracking-[0.2em] mt-1 ml-10">
            WEAR IT VIRTUALLY<br />BE YOURSELF
          </p>
        </div>
      </div>

      <div class="flex items-end justify-between">
        <div class="max-w-md">
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-primary font-bold text-black leading-[1.1]">
            Your Style,<br />Your Way
          </h1>
          <p class="text-md text-neutral font-primary mt-4">
            Try. Explore. Express.<br />All from anywhere.
          </p>
        </div>

        <div class="hidden lg:flex items-end gap-6">
          <div class="relative">
            <p class="text-lg text-black font-primary italic opacity-70 rotate-[-8deg]">
              Virtual Try On
            </p>
            <svg class="absolute -bottom-8 -left-4 w-16 h-16 text-black/30" viewBox="0 0 64 64" fill="none">
              <path d="M8 8 C20 20, 30 30, 40 40" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
              <path d="M36 36 L44 40 L38 44" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>

          <div class="flex flex-col gap-2">
            <div class="w-10 h-14 rounded-md bg-tertiary/80 border border-white/40" />
            <div class="w-10 h-14 rounded-md bg-neutral/30 border border-white/40" />
            <div class="w-10 h-14 rounded-md bg-primary/20 border border-white/40" />
            <div class="w-10 h-14 rounded-md bg-black/20 border border-white/40" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
