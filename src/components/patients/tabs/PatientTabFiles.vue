<template>
  <div class="space-y-6">
    
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
          <FolderArchive class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            Entregables, Fichas Oficiales & Documentos
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Fichas clínicas imprimibles, reportes de avances y estudios de laboratorio de {{ patient.nombre }}.
          </p>
        </div>
      </div>
    </div>

    <!-- Official Deliverables Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Card 1: Official Recommendations Sheet Generator -->
      <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border-2 border-[#7e9455]/40 hover:border-[#7e9455] transition-all flex flex-col justify-between space-y-4 group shadow-sm">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-2xl bg-[#7e9455]/15 text-[#556637] dark:text-[#9eb07a] border border-[#7e9455]/30 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <FileText class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#7e9455]/20 text-[#3f4e24] dark:text-[#baccb1] border border-[#7e9455]/40">
              Oficial • 1 Página Carta
            </span>
          </div>

          <div>
            <h4 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#556637] dark:group-hover:text-[#9eb07a] transition-colors">
              Hoja de Recomendaciones Oficial
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
              Genera la ficha personalizada con los 6 módulos clínicos adaptados con IA para los padecimientos de <strong>{{ patient.nombre }}</strong> ({{ patient.alertasMedicas?.join(', ') || 'Sin padecimientos' }}).
            </p>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <span class="text-xs font-bold text-[#556637] dark:text-[#9eb07a]">Formato Talia Tinoco</span>
          <button
            @click="$emit('openRecommendations')"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            style="background: linear-gradient(135deg, #7e9455 0%, #5b6f39 100%);"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>Abrir & Exportar PDF</span>
          </button>
        </div>
      </div>

      <!-- Card 2: Reporte de Avances Antropométricos PDF -->
      <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border-2 border-indigo-500/30 hover:border-indigo-500 transition-all flex flex-col justify-between space-y-4 group shadow-sm">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <BarChart3 class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Analítica • Gráficas
            </span>
          </div>

          <div>
            <h4 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Reporte Antropométrico Clínico
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
              Visualiza y descarga el informe de 3 páginas con evolución de peso, % grasa (Durnin-Womersley), comparativa inicio vs. actual y sumatoria de pliegues.
            </p>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">Motor de Gráficas BodyFlow</span>
          <button
            @click="$emit('goToMeasurements')"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Ver Gráficas & Descargar</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Uploaded Documents / Lab Studies List -->
    <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-extrabold text-slate-900 dark:text-white text-sm" style="font-family: var(--font-display);">
            Documentos Clínicos & Estudios de Laboratorio
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Análisis de sangre, química sanguínea, perfil tiroideo o PDFs externos</p>
        </div>

        <button
          @click="handleUploadDoc"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <UploadCloud class="w-3.5 h-3.5" />
          <span>Subir Documento</span>
        </button>
      </div>

      <!-- Sample / Empty State for lab studies -->
      <div class="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center space-y-2">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          No hay estudios de laboratorio adjuntos para este paciente.
        </p>
        <span class="text-[11px] text-slate-400">
          Los archivos PDF y fotos de estudios adjuntos se almacenarán de forma segura en Firestore Storage.
        </span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { 
  FolderArchive, 
  FileText, 
  Printer, 
  BarChart3, 
  Download, 
  UploadCloud 
} from 'lucide-vue-next';
import type { Patient } from '../../../types/patient';

defineProps<{
  patient: Patient;
}>();

defineEmits<{
  (e: 'openRecommendations'): void;
  (e: 'goToMeasurements'): void;
}>();

function handleUploadDoc() {
  alert('Función de subida de archivos adjuntos (PDF/Imágenes a Firebase Storage). Disponible en la próxima actualización.');
}
</script>
