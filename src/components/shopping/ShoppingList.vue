<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Action Bar & View Switch (Hidden on print) -->
    <div class="bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print transition-colors">
      <!-- Left: View Mode Switcher & Patient Quick Input -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="inline-flex p-1 bg-slate-100 dark:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner">
          <button
            @click="viewMode = 'stylized'"
            :class="[
              viewMode === 'stylized'
                ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium'
            ]"
            class="px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center space-x-1.5"
          >
            <span>🎨</span>
            <span>Vista Estilizada</span>
          </button>
          <button
            @click="viewMode = 'standard'"
            :class="[
              viewMode === 'standard'
                ? 'bg-white dark:bg-white/20 text-slate-800 dark:text-white shadow-sm font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium'
            ]"
            class="px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center space-x-1.5"
          >
            <span>📋</span>
            <span>Vista Lista</span>
          </button>
        </div>

        <div v-if="viewMode === 'standard'" class="hidden sm:flex items-center space-x-2">
          <button
            @click="toggleAllCheckboxes(true)"
            class="px-2.5 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10"
          >
            ☑ Todos
          </button>
          <button
            @click="toggleAllCheckboxes(false)"
            class="px-2.5 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10"
          >
            ☐ Ninguno
          </button>
        </div>
      </div>

      <!-- Right: Action Buttons (Styled to match Recommendations Wizard) -->
      <div class="flex items-center flex-wrap gap-2.5">
        <button
          @click="showAuditModal = true"
          class="px-3 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
        >
          📊 Datos Detectados
        </button>

        <button
          @click="triggerPrint"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold transition-all border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs"
        >
          <Printer class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Imprimir</span>
        </button>

        <button
          @click="downloadPDF"
          :disabled="isGeneratingPdf"
          class="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
          style="background: linear-gradient(135deg, #7e9455 0%, #5b6f39 100%);"
        >
          <Loader2 v-if="isGeneratingPdf" class="w-4 h-4 animate-spin" />
          <Download v-else class="w-4 h-4" />
          <span>{{ isGeneratingPdf ? 'Generando PDF...' : 'Descargar en PDF' }}</span>
        </button>

        <button
          @click="$emit('newList')"
          class="px-3.5 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          🔄 Nueva Lista
        </button>
      </div>
    </div>

    <!-- VIEW 1: Stylized Card (Infographic with organic pastel blob boxes) -->
    <StylizedShoppingCard
      v-if="viewMode === 'stylized'"
      :result="result"
      :initialPatientName="globalPatientName"
    />

    <!-- VIEW 2: Standard Detailed List -->
    <div
      v-else
      class="bg-white dark:bg-[#18181b] p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl space-y-6 print-letter-card relative overflow-hidden transition-colors"
    >
      <!-- Watermark Official Logo Image Layer -->
      <div class="watermark-layer pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden opacity-[0.045] z-0">
        <div class="w-[340px] sm:w-[420px] md:w-[480px] h-[340px] sm:h-[420px] md:h-[480px]">
          <TaliaLogo :watermark="true" />
        </div>
      </div>

      <!-- Printable Header -->
      <div class="border-b-2 border-slate-200 dark:border-white/10 pb-5 space-y-4 relative z-10">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">LISTA DE COMPRAS</h1>
            <p class="text-xs text-slate-600 dark:text-slate-400 font-medium">Plan Nutricional Saludable</p>
          </div>
          <div class="text-right text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div>Fecha: <strong>{{ result.generated_at }}</strong></div>
          </div>
        </div>

        <!-- Standardized Clinical Contact & Official Logo Banner -->
        <div>
          <TaliaClinicalBanner :logoSize="90" />
        </div>

        <!-- Meta info pill grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl text-xs">
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Dieta:</span>
            <span class="font-bold text-slate-800 dark:text-white">{{ result.diet_name }}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Días Planificados:</span>
            <span class="font-bold text-slate-800 dark:text-white">
              {{ result.total_days_planned || (result.selected_days.length * (result.cycle_multiplier || 1)) }} días
              <span v-if="result.cycle_multiplier && result.cycle_multiplier > 1" class="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] block">
                ({{ result.selected_days.length }} días base ×{{ result.cycle_multiplier }} ciclos)
              </span>
            </span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Estrategia:</span>
            <span class="font-bold text-slate-800 dark:text-white capitalize">{{ getStrategyLabel(result.purchase_strategy) }}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Merma Incluida:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">+10 %</span>
          </div>
        </div>
      </div>

      <!-- Categories Blocks -->
      <div class="space-y-6 relative z-10">
        <div
          v-for="group in result.categories"
          :key="group.category.id"
          class="space-y-2.5 print-category-group"
        >
          <div class="flex items-center space-x-2 border-b-2 border-emerald-500 pb-1.5">
            <span class="text-lg">{{ getCategoryEmoji(group.category.name) }}</span>
            <h2 class="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              {{ group.category.name }}
            </h2>
            <span class="text-xs font-semibold text-slate-400">({{ group.items.length }})</span>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-white/5">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="py-2.5 flex items-start justify-between space-x-4 hover:bg-slate-50/50 dark:hover:bg-white/5 px-2 rounded-lg transition-colors group print-item-row"
            >
              <div class="flex items-start space-x-3">
                <input
                  type="checkbox"
                  v-model="item.is_purchased"
                  class="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-white/20 focus:ring-emerald-500 cursor-pointer"
                />
                <div :class="{ 'line-through text-slate-400 dark:text-slate-600': item.is_purchased }">
                  <div class="flex items-center space-x-2">
                    <span class="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{{ item.normalized_name }}</span>
                    <span v-if="item.state !== 'raw' && item.state !== 'unspecified'" class="text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      {{ item.state }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 space-x-2 mt-0.5">
                    <span>Base: {{ item.calculated_quantity }} {{ item.unit }}</span>
                    <span>•</span>
                    <span class="text-emerald-700 dark:text-emerald-400 font-medium">Merma 10%: {{ item.quantity_with_waste }} {{ item.unit }}</span>
                  </div>
                  <p v-if="item.notes" class="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">{{ item.notes }}</p>
                </div>
              </div>

              <!-- Suggested purchase badge -->
              <div class="text-right">
                <span class="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-extrabold text-xs sm:text-sm rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                  {{ item.purchase_quantity }}
                </span>
                <span class="block text-[9px] text-slate-400 font-semibold mt-0.5">Compra sugerida</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Unspecified Quantities / Al Gusto -->
        <div v-if="result.unspecified_items.length > 0" class="space-y-2.5 pt-3 print-category-group">
          <div class="flex items-center space-x-2 border-b-2 border-amber-500 pb-1.5">
            <span class="text-lg">🧂</span>
            <h2 class="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              CANTIDAD NO ESPECIFICADA / AL GUSTO
            </h2>
            <span class="text-xs font-semibold text-amber-600 dark:text-amber-400">({{ result.unspecified_items.length }})</span>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-white/5">
            <div
              v-for="item in result.unspecified_items"
              :key="item.id"
              class="py-2.5 flex items-center justify-between space-x-4 hover:bg-slate-50/50 dark:hover:bg-white/5 px-2 rounded-lg print-item-row"
            >
              <div class="flex items-center space-x-3">
                <input
                  type="checkbox"
                  v-model="item.is_purchased"
                  class="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-white/20 focus:ring-emerald-500 cursor-pointer"
                />
                <span class="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-sm" :class="{ 'line-through text-slate-400 dark:text-slate-600': item.is_purchased }">
                  {{ item.normalized_name }}
                </span>
              </div>
              <span class="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/40">
                {{ item.notes || 'Al gusto' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Motivational Quote on Standard View -->
      <div class="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 p-3.5 rounded-2xl flex items-center justify-between space-x-3 relative z-10 print-footer-block">
        <div class="flex items-center space-x-2.5">
          <span class="text-lg">💪</span>
          <p class="text-xs font-extrabold text-slate-800 dark:text-slate-200 italic">
            “Disciplina hoy, resultados mañana.”
          </p>
        </div>
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          Lic. N. Talia Tinoco Fabián • Céd. 11290678
        </span>
      </div>

      <!-- Mandatory Waste Legal Notice (Section 22) -->
      <div class="bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-600 p-4 rounded-r-2xl space-y-1 relative z-10 print-footer-block">
        <h4 class="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Nota sobre Merma:</h4>
        <p class="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
          "{{ result.waste_note }}"
        </p>
      </div>
    </div>

    <!-- Audit Modal -->
    <AuditDialog
      :isOpen="showAuditModal"
      :result="result"
      @close="showAuditModal = false"
    />
  </div>


  <!-- Segunda página: Guía de Marcas (se imprime al reverso) — solo en vista lista -->
  <BrandRecommendationsPage
    v-if="viewMode !== 'stylized'"
    :purchase-strategy="result.purchase_strategy"
    :category-slugs="listCategorySlugs"
  />

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Printer, Download, Loader2 } from 'lucide-vue-next';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import type { ShoppingListCalculationResult, PurchaseStrategy  } from '../../types/shoppingDiet';
import AuditDialog from './AuditDialog.vue';
import StylizedShoppingCard from './StylizedShoppingCard.vue';
import TaliaLogo from './TaliaLogo.vue';
import TaliaClinicalBanner from '../common/TaliaClinicalBanner.vue';
import BrandRecommendationsPage from './BrandRecommendationsPage.vue';

const props = defineProps<{
  result: ShoppingListCalculationResult;
}>();

defineEmits<{
  (e: 'newList'): void;
}>();

const viewMode = ref<'stylized' | 'standard'>('stylized'); // Default to stylized per request
const globalPatientName = ref('');
const showAuditModal = ref(false);
const isGeneratingPdf = ref(false);

// Category slugs for brand recommendations page
const listCategorySlugs = computed(() =>
  props.result.categories.map((cg) => cg.category.slug ?? cg.category.name.toLowerCase())
);

function triggerPrint() {
  window.print();
}

async function downloadPDF() {
  if (isGeneratingPdf.value) return;
  isGeneratingPdf.value = true;

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 4;
    const contentWidth = pageWidth - margin * 2;

    if (viewMode.value === 'stylized') {
      // 1. Capture Page 1: Stylized Shopping List
      const page1El = document.querySelector<HTMLElement>('.stylized-shopping-container');
      if (!page1El) throw new Error('No se encontró la página de la lista de compras.');

      const imgData1 = await toJpeg(page1El, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node: Node) => {
          if (node instanceof HTMLElement && node.classList.contains('no-print')) {
            return false;
          }
          return true;
        },
      });

      const img1 = new Image();
      img1.src = imgData1;
      await new Promise<void>((res) => {
        if (img1.complete) res();
        else img1.onload = () => res();
      });

      const imgHeight1 = (img1.height * contentWidth) / img1.width;
      const finalHeight1 = Math.min(imgHeight1, pageHeight - margin * 2);
      pdf.addImage(imgData1, 'JPEG', margin, margin, contentWidth, finalHeight1);

      // 2. Capture Page 2: Brand Recommendations Page
      const page2El = document.querySelector<HTMLElement>('.brands-page-container');
      if (page2El) {
        const imgData2 = await toJpeg(page2El, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          filter: (node: Node) => {
            if (node instanceof HTMLElement && node.classList.contains('no-print')) {
              return false;
            }
            return true;
          },
        });

        const img2 = new Image();
        img2.src = imgData2;
        await new Promise<void>((res) => {
          if (img2.complete) res();
          else img2.onload = () => res();
        });

        pdf.addPage('letter', 'portrait');
        const imgHeight2 = (img2.height * contentWidth) / img2.width;
        const finalHeight2 = Math.min(imgHeight2, pageHeight - margin * 2);
        pdf.addImage(imgData2, 'JPEG', margin, margin, contentWidth, finalHeight2);
      }
    } else {
      // Standard list mode
      const listEl = document.querySelector<HTMLElement>('.print-letter-card');
      if (listEl) {
        const imgData = await toJpeg(listEl, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          filter: (node: Node) => {
            if (node instanceof HTMLElement && node.classList.contains('no-print')) {
              return false;
            }
            return true;
          },
        });

        const img = new Image();
        img.src = imgData;
        await new Promise<void>((res) => {
          if (img.complete) res();
          else img.onload = () => res();
        });

        const imgHeight = (img.height * contentWidth) / img.width;
        const finalHeight = Math.min(imgHeight, pageHeight - margin * 2);
        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, finalHeight);
      }
    }

    const filename = `Lista_de_Compras_Talia_Tinoco.pdf`;
    pdf.save(filename);
  } catch (err: any) {
    console.error('Error generando PDF de lista de compras:', err);
    alert('Ocurrió un error al generar el archivo PDF: ' + (err.message || err));
  } finally {
    isGeneratingPdf.value = false;
  }
}

function toggleAllCheckboxes(purchased: boolean) {
  for (const catGroup of props.result.categories) {
    for (const item of catGroup.items) {
      item.is_purchased = purchased;
    }
  }
  for (const item of props.result.unspecified_items) {
    item.is_purchased = purchased;
  }
}

function getStrategyLabel(strat: PurchaseStrategy): string {
  if (strat === 'value') return 'Calidad / Precio';
  if (strat === 'economic') return 'Económica';
  if (strat === 'premium') return 'Premium';
  return 'Sin preferencia';
}

function getCategoryEmoji(catName: string): string {
  if (catName.includes('Proteínas')) return '🥩';
  if (catName.includes('Cereales')) return '🌾';
  if (catName.includes('Verduras')) return '🥦';
  if (catName.includes('Frutas')) return '🍎';
  if (catName.includes('Grasas')) return '🥑';
  if (catName.includes('Leguminosas')) return '🫘';
  if (catName.includes('Lácteos')) return '🥛';
  return '🛒';
}
</script>

<style scoped>
/* Page & Print Optimizations for Letter Size */
@page {
  size: letter portrait;
  margin: 10mm 12mm;
}

.print-category-group {
  break-inside: avoid;
  page-break-inside: avoid;
}

.print-footer-block {
  break-inside: avoid;
  page-break-inside: avoid;
}

@media print {
  .no-print {
    display: none !important;
  }

  .print-letter-card {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>

