<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header Card -->
    <div class="bg-white dark:bg-[#18181b] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm text-center space-y-3 transition-colors relative">
      <div class="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full text-4xl mb-2 border border-emerald-200 dark:border-emerald-800/40">
        🥗
      </div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Subir Dieta o Menú</h2>
      <p class="text-slate-500 dark:text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
        Sube un plan de alimentación en formato <strong>PDF, Word (.docx), Imagen (.jpg, .png) o Excel (.xlsx)</strong> para que la Inteligencia Artificial analice automáticamente los días, comidas, ingredientes y cantidades.
      </p>

      <!-- Supported Formats Pills -->
      <div class="flex items-center justify-center flex-wrap gap-2 pt-1">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
          📄 PDF
        </span>
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
          📝 Word (.docx)
        </span>
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
          🖼️ Imagen (.png, .jpg)
        </span>
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
          📊 Excel (.xlsx, .csv)
        </span>
      </div>
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
        accept=".pdf, .docx, .doc, .xlsx, .xls, .csv, .txt, .png, .jpg, .jpeg, .webp, image/*, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        class="hidden"
        @change="handleFileChange"
      />

      <div class="space-y-4">
        <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold border border-emerald-300 dark:border-emerald-700/50">
          ↑
        </div>
        <div>
          <p class="text-slate-800 dark:text-slate-200 font-semibold text-base">
            Haz clic para seleccionar o arrastra tu archivo aquí
          </p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Formatos soportados: PDF, Word (.docx), Imágenes (.png, .jpg, .webp), Excel (.xlsx, .csv) o Texto (Máx. 20 MB)
          </p>
        </div>
      </div>
    </div>

    <!-- Error alert -->
    <div v-if="errorMessage" class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ errorMessage }}</span>
      </div>
      <button @click="errorMessage = ''" class="text-red-500 hover:text-red-400 font-bold px-1 cursor-pointer">✕</button>
    </div>

    <!-- Sample Diet Button -->
    <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
      <span class="text-xs text-slate-500 dark:text-slate-400">¿No tienes un archivo a la mano?</span>
      <button
        @click="$emit('loadSample')"
        class="px-4 py-2.5 bg-slate-800 dark:bg-white/10 hover:bg-slate-900 dark:hover:bg-white/20 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 border border-slate-700 dark:border-white/10 cursor-pointer"
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

const SUPPORTED_EXTENSIONS = [
  'pdf', 'docx', 'doc', 'xlsx', 'xls', 'csv', 'txt', 'md', 'png', 'jpg', 'jpeg', 'webp', 'bmp'
];

function validateAndProcess(file: File) {
  errorMessage.value = '';

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext);
  const isSupported = SUPPORTED_EXTENSIONS.includes(ext) || isImage;

  if (!isSupported) {
    errorMessage.value = 'Formato no soportado. Por favor sube un archivo PDF, Word (.docx), Imagen (.png, .jpg), Excel (.xlsx) o Texto.';
    return;
  }

  if (file.size > 20 * 1024 * 1024) {
    errorMessage.value = 'El archivo supera el tamaño máximo permitido de 20 MB.';
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
