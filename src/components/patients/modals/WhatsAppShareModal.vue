<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
    <div class="max-w-2xl w-full p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl relative my-8 bg-white dark:bg-[#18181b] transition-all text-slate-900 dark:text-white flex flex-col max-h-[92vh]">
      
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10 cursor-pointer"
        title="Cerrar modal"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Header -->
      <div class="border-b border-slate-100 dark:border-white/10 pb-4 mb-4 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black shadow-inner">
            <MessageSquare class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white leading-tight" style="font-family: var(--font-display);">
              Enviar Plan y Menú por WhatsApp
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Personaliza el mensaje, descarga los archivos PDF y Word para adjuntar y envía directamente al paciente.
            </p>
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="space-y-4 overflow-y-auto pr-1 pb-1 scrollbar-thin">
        
        <!-- Recipient Phone Input -->
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Número de WhatsApp del Paciente
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="phone"
              type="tel"
              placeholder="ej. 3541123456 (10 dígitos)"
              class="w-full px-3.5 py-2 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span v-if="patient.telefono" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              ✓ Del expediente
            </span>
          </div>
          <p class="text-[10px] text-slate-400">
            Si no incluye código internacional, se agregará automáticamente el prefijo de México (+52).
          </p>
        </div>

        <!-- Dedicated Attachment Helpers (PDF, Word, Shopping List) -->
        <div class="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Paperclip class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Descarga de Documentos para Adjuntar al Chat</span>
            </span>
            <span class="text-[10px] text-slate-400">Descarga y arrastra al chat</span>
          </div>

          <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            WhatsApp no permite enviar archivos binarios (.pdf / .doc) automáticamente a través de enlaces web sin interacción. Puedes descargar los archivos con un clic y adjuntarlos en la conversación:
          </p>

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              @click="downloadPdf"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/40 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileText class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>📄 Descargar PDF Oficial</span>
            </button>

            <button
              type="button"
              @click="downloadWord"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/40 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>📝 Descargar Word (.doc)</span>
            </button>
          </div>
        </div>

        <!-- Content sections toggles -->
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
              Secciones del Mensaje
            </span>
            <button
              type="button"
              @click="refreshMessage"
              class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              🔄 Restablecer plantilla base
            </button>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                v-model="options.incluirDesgloseComidas"
                type="checkbox"
                class="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                @change="refreshMessage"
              />
              <span>Desglose de Comidas</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                v-model="options.incluirListaCompras"
                type="checkbox"
                class="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                @change="refreshMessage"
              />
              <span>Lista de Compras</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                v-model="options.incluirIndicaciones"
                type="checkbox"
                class="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                @change="refreshMessage"
              />
              <span>Notas Clínicas</span>
            </label>
          </div>
        </div>

        <!-- Editable Message Preview -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Mensaje Personalizado (Editable)
            </label>
            <button
              type="button"
              @click="copyToClipboard"
              class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>{{ copied ? '✓ ¡Copiado al portapapeles!' : 'Copiar texto' }}</span>
            </button>
          </div>
          <textarea
            v-model="customMessage"
            rows="8"
            class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            placeholder="Escribe o ajusta aquí el mensaje para tu paciente..."
          ></textarea>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer"
        >
          Cerrar
        </button>
        <button
          type="button"
          @click="handleSendWhatsApp"
          class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 transition-all"
        >
          <Send class="w-4 h-4" />
          <span>Abrir WhatsApp Web / App</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { 
  X, 
  MessageSquare, 
  Copy, 
  Send, 
  Paperclip, 
  FileText, 
  Download 
} from 'lucide-vue-next';
import type { Patient, PatientDietPlan } from '../../../types/patient';
import type { DietPlanMenu } from '../../../types/dietMenu';
import { MenuExportService } from '../../../services/nutrition/MenuExportService';

const props = defineProps<{
  patient: Patient;
  plan: PatientDietPlan;
  menu: DietPlanMenu;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const phone = ref(props.patient.telefono || '');
const copied = ref(false);

const options = reactive({
  incluirDesgloseComidas: true,
  incluirListaCompras: true,
  incluirIndicaciones: true
});

const customMessage = ref('');

function refreshMessage() {
  customMessage.value = MenuExportService.generateWhatsAppMessage(
    props.patient,
    props.plan,
    props.menu,
    options
  );
}

onMounted(() => {
  refreshMessage();
});

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(customMessage.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch {}
}

function downloadPdf() {
  MenuExportService.exportMenuToPdf(props.patient, props.plan, props.menu);
}

function downloadWord() {
  MenuExportService.exportMenuToWord(props.patient, props.plan, props.menu);
}

function handleSendWhatsApp() {
  // Copy text to clipboard as backup for user convenience
  copyToClipboard();
  const url = MenuExportService.getWhatsAppUrl(phone.value, customMessage.value);
  window.open(url, '_blank');
}
</script>
