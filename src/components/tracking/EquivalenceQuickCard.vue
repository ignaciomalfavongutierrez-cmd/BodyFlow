<template>
  <div class="glass-card p-4 sm:p-5 border border-emerald-500/25 relative overflow-hidden group shadow-lg transition-all duration-300 hover:border-emerald-500/40">
    <!-- Background subtle glow -->
    <div class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20" style="background: var(--kinetic-glow, #19e80d);"></div>

    <div class="relative z-10">
      <!-- Header row: Icon, Title & Offline Badge -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-3">
          <div 
            class="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-black shadow-md transition-transform group-hover:scale-105 shrink-0"
            style="background: var(--kinetic-glow, #19e80d);"
          >
            <Scale class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm sm:text-base font-extrabold tracking-wide text-white" style="font-family: var(--font-display);">
                Guía de Equivalencias SMAE
              </h3>
              <span class="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#87ff70] border border-emerald-500/30">
                <span class="w-1.5 h-1.5 rounded-full bg-[#19e80d] animate-pulse"></span>
                Offline
              </span>
            </div>
            <p class="text-[11px] text-gray-400 mt-0.5 leading-snug">
              Intercambia alimentos de tu plan respetando sus porciones y calorías oficiales.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Group Pills (Visual preview of the food categories) -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-3.5">
        <span class="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 whitespace-nowrap">
          🥦 Verduras
        </span>
        <span class="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 whitespace-nowrap">
          🍎 Frutas
        </span>
        <span class="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 whitespace-nowrap">
          🌽 Cereales
        </span>
        <span class="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 whitespace-nowrap">
          🥩 Proteínas
        </span>
        <span class="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 whitespace-nowrap">
          🥑 Grasas
        </span>
        <span class="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 whitespace-nowrap">
          🥛 Lácteos
        </span>
      </div>

      <!-- Action Buttons Row -->
      <div class="flex items-center gap-2 pt-2 border-t border-white/5">
        <!-- Main Open Modal Action -->
        <button
          @click="openModal"
          class="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md hover:brightness-105"
          style="background: var(--kinetic-glow, #19e80d);"
        >
          <Search class="w-3.5 h-3.5" />
          <span>Consultar Intercambios</span>
        </button>

        <!-- Direct PDF Download Helper -->
        <button
          @click="downloadDirect"
          :disabled="isGeneratingPdf"
          class="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-gray-200 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          title="Descargar Hoja Oficial en PDF"
        >
          <Loader2 v-if="isGeneratingPdf" class="w-3.5 h-3.5 animate-spin" />
          <Download v-else class="w-3.5 h-3.5 text-[#87ff70]" />
          <span class="hidden xs:inline">PDF</span>
        </button>
      </div>
    </div>

    <!-- Equivalence Lookup Modal (Interactive offline browser + calculator) -->
    <EquivalenceLookupModal
      :isOpen="isModalOpen"
      @close="isModalOpen = false"
    />

    <!-- Off-screen container for direct PDF download triggered from card -->
    <div id="card-pdf-render-container" class="hidden-pdf-host">
      <EquivalenceSheet
        v-if="renderPdfSheet"
        patientName="Paciente BodyFlow"
        :isPrinting="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Scale, Search, Download, Loader2 } from 'lucide-vue-next';
import EquivalenceLookupModal from '../equivalences/EquivalenceLookupModal.vue';
import EquivalenceSheet from '../equivalences/EquivalenceSheet.vue';
import { EquivalenceExportService } from '../../services/nutrition/EquivalenceExportService';

const isModalOpen = ref(false);
const isGeneratingPdf = ref(false);
const renderPdfSheet = ref(false);

function openModal() {
  isModalOpen.value = true;
}

async function downloadDirect() {
  if (isGeneratingPdf.value) return;
  isGeneratingPdf.value = true;
  renderPdfSheet.value = true;

  try {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 150));

    const sheetEl = document.getElementById('printable-equivalence-sheet');
    if (!sheetEl) throw new Error('No se encontró el elemento imprimible');

    await EquivalenceExportService.exportSheetToPdf(sheetEl, 'General');
  } catch (err: any) {
    console.error('Error descargando PDF directo:', err);
    alert('Error al descargar el PDF: ' + (err.message || err));
  } finally {
    isGeneratingPdf.value = false;
    renderPdfSheet.value = false;
  }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hidden-pdf-host {
  position: fixed;
  left: -99999px;
  top: 0;
  width: 850px;
  pointer-events: none;
  background: #fafbf7;
}
</style>
