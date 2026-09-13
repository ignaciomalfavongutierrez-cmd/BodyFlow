  <template>
  <!-- 
    BrandRecommendationsPage.vue
    Segunda página imprimible con guía de marcas recomendadas según estrategia de compra.
    Se fuerza a nueva hoja en impresión con page-break-before: always.
  -->
  <div class="brands-page-container relative overflow-hidden bg-[#fbf8f3] p-4 sm:p-5 md:p-6 rounded-[28px] border border-amber-200/60 shadow-xl space-y-3.5 max-w-4xl mx-auto mt-6 brands-print-page">

    <!-- Watermark -->
    <div class="watermark-layer pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden opacity-[0.045] z-0">
      <div class="w-[300px] sm:w-[380px] md:w-[420px] h-[300px] sm:h-[380px] md:h-[420px]">
        <TaliaLogo :watermark="true" />
      </div>
    </div>

    <!-- Header: Page Title (Clean & Dignified, no stigmatizing economic badge) -->
    <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-b-2 border-slate-800/10 pb-2.5">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-sans">
          GUÍA DE MARCAS RECOMENDADAS
        </h2>
        <div class="text-[10px] text-slate-600 font-medium">Sugerencias y opciones recomendadas para tus compras</div>
      </div>

      <!-- Right: Clean, professional supermarket guide badge -->
      <div class="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
        <span>🛒</span>
        <span class="text-[10px] uppercase tracking-wider font-extrabold">Guía de Supermercado</span>
      </div>
    </div>

    <!-- Standardized Clinical Contact & Official Logo Banner (Compact) -->
    <div class="relative z-10">
      <TaliaClinicalBanner :logoSize="55" />
    </div>

    <!-- Grid of brand cards — 2 columns (Compact & streamlined for 1 sheet double-sided fit) -->
    <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
      <div
        v-for="cat in recommendations"
        :key="cat.categorySlug"
        class="brand-card p-3 sm:p-3.5 bg-white/85 border border-slate-200/80 shadow-xs"
        :style="{ borderRadius: getBlobRadius(cat.categorySlug) }"
      >
        <!-- Category header pill -->
        <div class="flex items-center justify-between mb-2">
          <div
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase flex items-center space-x-1.5 shadow-xs"
            :style="getCategoryPillStyle(cat.categorySlug)"
          >
            <span>{{ cat.emoji }}</span>
            <span>{{ cat.categoryName }}</span>
          </div>
          <span
            class="text-[9.5px] font-bold opacity-60 italic"
            :style="{ color: getCategoryTextColor(cat.categorySlug) }"
          >{{ cat.headline }}</span>
        </div>

        <!-- Brand list: Top 3 brand suggestions per category to guarantee single sheet back-side fit -->
        <ul class="space-y-1.5">
          <li
            v-for="brand in cat.brands.slice(0, 3)"
            :key="brand.name"
            class="flex items-start space-x-1.5"
          >
            <span class="text-xs flex-shrink-0 mt-0.5 opacity-70">🏷️</span>
            <div class="flex-1 min-w-0">
              <span class="text-[11px] font-bold text-slate-800 block truncate">{{ brand.name }}</span>
              <span v-if="brand.tip" class="block text-[9.5px] text-slate-500 font-medium italic leading-tight truncate">
                {{ brand.tip }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer note -->
    <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800/10 footer-seal-box">
      <div class="text-[9px] text-slate-500 font-medium text-center sm:text-left leading-tight max-w-sm">
        ⚠️ <strong>Nota:</strong> Las marcas son sugerencias orientativas de calidad. Verifica siempre los ingredientes en la etiqueta.
      </div>
      <div class="text-center text-[9.5px] font-bold text-slate-600 flex flex-col items-center">
        <span class="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Lic. N. Talia Tinoco Fabián • Céd. 11290678</span>
        <span class="text-slate-400">Nutrición Clínica • México</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PurchaseStrategy  } from '../../types/shoppingDiet';
import { BrandRecommendationService, type CategoryBrandRecommendation } from '../../services/shopping/BrandRecommendationService';
import TaliaLogo from './TaliaLogo.vue';
import TaliaClinicalBanner from '../common/TaliaClinicalBanner.vue';

const props = defineProps<{
  purchaseStrategy: PurchaseStrategy;
  /** Raw category slugs/names from the shopping result */
  categorySlugs: string[];
}>();

const recommendations = computed<CategoryBrandRecommendation[]>(() =>
  BrandRecommendationService.getRecommendations(props.categorySlugs, props.purchaseStrategy)
);

// ── Visual helpers (mirror StylizedShoppingCard themes) ──────────────────────

const BLOB_RADII: Record<string, string> = {
  proteina:    '30px 20px 34px 22px / 24px 32px 22px 30px',
  cereales:    '24px 34px 22px 32px / 32px 22px 34px 24px',
  frutas:      '32px 22px 28px 34px / 26px 34px 24px 32px',
  lacteos:     '26px 34px 24px 32px / 32px 24px 34px 26px',
  verduras:    '32px 24px 34px 22px / 24px 34px 22px 32px',
  grasas:      '22px 34px 26px 32px / 32px 24px 32px 26px',
  leguminosas: '28px 22px 32px 24px / 24px 32px 24px 30px',
  otros:       '24px 30px 22px 34px / 32px 22px 32px 24px',
};

const PILL_STYLES: Record<string, { bg: string; color: string }> = {
  proteina:    { bg: '#f2a8b5', color: '#5e1d24' },
  cereales:    { bg: '#f7bcc5', color: '#5f2631' },
  frutas:      { bg: '#c1b3da', color: '#3d2b63' },
  lacteos:     { bg: '#96d8f7', color: '#154868' },
  verduras:    { bg: '#afd370', color: '#334e12' },
  grasas:      { bg: '#f5b78f', color: '#6d3513' },
  leguminosas: { bg: '#f9dc75', color: '#5c4d0a' },
  otros:       { bg: '#f3cc86', color: '#64440f' },
};

function getBlobRadius(slug: string): string {
  return BLOB_RADII[slug] ?? '24px';
}

function getCategoryPillStyle(slug: string) {
  const s = PILL_STYLES[slug] ?? { bg: '#e2e8f0', color: '#334155' };
  return { backgroundColor: s.bg, color: s.color };
}

function getCategoryTextColor(slug: string): string {
  return PILL_STYLES[slug]?.color ?? '#334155';
}
</script>

<style scoped>
@page {
  size: letter portrait;
  margin: 6mm 8mm;
}

.brand-card {
  break-inside: avoid;
  page-break-inside: avoid;
}

.footer-seal-box {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Force this entire page to start on a new sheet (reverse side) when printing */
.brands-print-page {
  break-before: page;
  page-break-before: always;
  break-after: avoid;
  page-break-after: avoid;
}

@media print {
  .brands-page-container {
    box-shadow: none !important;
    border: none !important;
    padding: 3mm 5mm !important;
    max-width: 100% !important;
    width: 100% !important;
    background: #fbf8f3 !important;
    margin-top: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  .brand-card {
    box-shadow: none !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    padding: 8px 10px !important;
  }

  .watermark-layer {
    opacity: 0.04 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
