<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header Card -->
    <div class="bg-white dark:bg-[#18181b] rounded-2xl p-8 border border-slate-200 dark:border-white/10 shadow-sm text-center space-y-3 transition-colors">
      <div class="inline-flex p-4 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full text-4xl mb-2 border border-indigo-200 dark:border-indigo-800/40">
        📊
      </div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Avances y Progreso Clínico</h2>
      <p class="text-slate-500 dark:text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
        Sube la historia clínica o registro de consultas en Word (.docx) o Excel (.xlsx, .csv). El sistema extraerá automáticamente fechas, medidas antropométricas, pliegues y composición corporal.
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
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
          : 'border-slate-300 dark:border-white/15 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-white/5'
      ]"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".docx,.xlsx,.xls,.csv"
        class="hidden"
        @change="handleFileChange"
      />

      <div class="space-y-4">
        <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold border border-indigo-300 dark:border-indigo-700/50">
          ↑
        </div>
        <div>
          <p class="text-slate-800 dark:text-slate-200 font-semibold text-base">
            Haz clic para seleccionar o arrastra tu archivo aquí
          </p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Formatos admitidos: Word (.docx), Excel (.xlsx, .xls, .csv) • Máximo 15 MB</p>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
      <span>⚠️ {{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="text-red-500 hover:text-red-400 font-bold">✕</button>
    </div>

    <!-- Sample Data & Manual Option -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
      <span class="text-xs text-slate-500 dark:text-slate-400">¿Deseas probar el módulo con un paciente real?</span>
      <div class="flex items-center space-x-2">
        <button
          @click="$emit('loadSample')"
          class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-2"
        >
          <span>🧪 Cargar Paciente de Ejemplo (5 Visitas)</span>
        </button>
        <button
          @click="$emit('createManual')"
          class="px-3.5 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-white/10"
        >
          <span>➕ Registro Manual</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'fileSelected', file: File): void;
  (e: 'loadSample'): void;
  (e: 'createManual'): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const errorMessage = ref('');

function triggerFileInput() {
  fileInput.value?.click();
}

function validateAndProcess(file: File) {
  errorMessage.value = '';
  const validExtensions = ['.docx', '.xlsx', '.xls', '.csv'];
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');

  if (!validExtensions.includes(ext)) {
    errorMessage.value = 'El archivo seleccionado debe ser en formato Word (.docx) o Excel (.xlsx, .xls, .csv)';
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    errorMessage.value = 'El archivo supera el tamaño máximo permitido de 15 MB';
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
