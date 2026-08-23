<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header Card -->
    <div class="bg-white dark:bg-[#18181b] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm text-center space-y-3 transition-colors relative">
      <div class="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full text-4xl mb-2 border border-emerald-200 dark:border-emerald-800/40">
        📄
      </div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Subir Dieta en PDF</h2>
      <p class="text-slate-500 dark:text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
        Sube un plan nutricional en formato PDF para que la Inteligencia Artificial analice automáticamente los días, comidas, ingredientes y cantidades.
      </p>

      <!-- Gemini Key Status Badge & Button -->
      <div class="pt-2 flex items-center justify-center gap-2">
        <button
          @click="showKeyModal = true"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer"
          :class="[
            hasKey
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 animate-pulse'
          ]"
        >
          <span>{{ hasKey ? '🟢' : '🔑' }}</span>
          <span>{{ hasKey ? 'Gemini IA Configurado' : 'Configurar Gemini API Key' }}</span>
          <span class="text-[10px] text-slate-400">⚙️</span>
        </button>
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
    <div v-if="errorMessage" class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ errorMessage }}</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          v-if="!hasKey || errorMessage.includes('clave de Gemini') || errorMessage.includes('API Key')"
          @click="showKeyModal = true"
          class="px-2.5 py-1 bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 font-bold rounded-lg hover:bg-red-200 transition-colors"
        >
          🔑 Ingresar Clave
        </button>
        <button @click="errorMessage = ''" class="text-red-500 hover:text-red-400 font-bold px-1">✕</button>
      </div>
    </div>

    <!-- Sample Diet Button -->
    <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
      <span class="text-xs text-slate-500 dark:text-slate-400">¿No tienes un PDF a la mano?</span>
      <button
        @click="$emit('loadSample')"
        class="px-4 py-2.5 bg-slate-800 dark:bg-white/10 hover:bg-slate-900 dark:hover:bg-white/20 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 border border-slate-700 dark:border-white/10 cursor-pointer"
      >
        <span>🧪 Probar con Dieta de Ejemplo (7 Días)</span>
      </button>
    </div>

    <!-- Gemini Key Config Modal -->
    <div
      v-if="showKeyModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🔑</span>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Configurar Gemini API Key</h3>
          </div>
          <button @click="showKeyModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">✕</button>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Ingresa tu clave de Google Gemini API (gratuita en <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-indigo-600 dark:text-indigo-400 underline font-bold">Google AI Studio</a>). Esta clave se guardará en tu navegador de forma segura.
        </p>

        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            API Key de Gemini
          </label>
          <input
            v-model="customApiKey"
            type="password"
            placeholder="AIzaSy..."
            class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div class="flex items-center justify-end space-x-2 pt-2">
          <button
            v-if="customApiKey"
            @click="clearKey"
            class="px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
          >
            Eliminar Clave
          </button>
          <button
            @click="showKeyModal = false"
            class="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="saveKey"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Guardar Clave
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { GeminiDietParserService } from '../../services/shopping/GeminiDietParserService';

const emit = defineEmits<{
  (e: 'fileSelected', file: File): void;
  (e: 'loadSample'): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const errorMessage = ref('');
const showKeyModal = ref(false);
const customApiKey = ref('');

const hasKey = computed(() => {
  return Boolean(GeminiDietParserService.getApiKey());
});

onMounted(() => {
  const saved = localStorage.getItem('bodyflow_gemini_api_key') || '';
  if (saved) {
    customApiKey.value = saved;
  }
});

function saveKey() {
  if (customApiKey.value && customApiKey.value.trim() !== '') {
    localStorage.setItem('bodyflow_gemini_api_key', customApiKey.value.trim());
  } else {
    localStorage.removeItem('bodyflow_gemini_api_key');
  }
  showKeyModal.value = false;
  errorMessage.value = '';
}

function clearKey() {
  localStorage.removeItem('bodyflow_gemini_api_key');
  customApiKey.value = '';
  showKeyModal.value = false;
}

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
