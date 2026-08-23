<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header Card -->
    <div class="bg-white dark:bg-[#18181b] rounded-2xl p-8 border border-slate-200 dark:border-white/10 shadow-sm text-center space-y-3 transition-colors">
      <div class="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full text-4xl mb-2 border border-emerald-200 dark:border-emerald-800/40">
        📄
      </div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Subir Dieta en PDF</h2>
      <p class="text-slate-500 dark:text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
        Sube un plan nutricional en formato PDF para que la Inteligencia Artificial analice automáticamente los días, comidas, ingredientes y cantidades.
      </p>
    </div>

    <!-- Drag & Drop Zone -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      class="border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-white dark:bg-[#18181b]"
      :class="[
        isDragging
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01]'
          : 'border-slate-300 dark:border-white/15 hover:border-emerald-400 dark:hover:border-emerald-400 hover:bg-slate-50/50 dark:hover:bg-white/5'
      ]"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="application/pdf"
        class="hidden"
        @change="handleFileChange"
      />

      <div class="space-y-4">
        <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold border border-emerald-300 dark:border-emerald-700/50">
          ↑
        </div>
        <div>
          <p class="text-slate-800 dark:text-slate-200 font-semibold text-base">
            Haz clic para seleccionar o arrastra tu archivo PDF aquí
          </p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Exclusivamente archivos .PDF (Máximo 10 MB)</p>
        </div>
      </div>
    </div>

    <!-- Error alert -->
    <div v-if="errorMessage" class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
      <span>⚠️ {{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="text-red-500 hover:text-red-400 font-bold">✕</button>
    </div>

    <!-- Sample Diet Button -->
    <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
      <span class="text-xs text-slate-500 dark:text-slate-400">¿No tienes un PDF a la mano?</span>
      <button
        @click="$emit('loadSample')"
        class="px-4 py-2.5 bg-slate-800 dark:bg-white/10 hover:bg-slate-900 dark:hover:bg-white/20 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 border border-slate-700 dark:border-white/10"
      >
        <span>🧪 Probar con Dieta de Ejemplo (7 Días)</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'fileSelected', file: File): void;
  (e: 'loadSample'): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const errorMessage = ref('');

function triggerFileInput() {
  fileInput.value?.click();
}

function validateAndProcess(file: File) {
  errorMessage.value = '';

  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    errorMessage.value = 'El archivo seleccionado debe ser exclusivamente de extensión .PDF';
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'El archivo PDF supera el tamaño máximo permitido de 10 MB';
    return;
  }

  emit('fileSelected', file);
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    validateAndProcess(target.files[0]);
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    validateAndProcess(event.dataTransfer.files[0]);
  }
}
</script>
