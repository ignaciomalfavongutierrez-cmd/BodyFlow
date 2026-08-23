<template>
  <!-- 
    BrandRecommendationsPage.vue
    Segunda página imprimible con guía de marcas recomendadas según estrategia de compra.
    Se fuerza a nueva hoja en impresión con page-break-before: always.
  -->
  <div class="brands-page-container relative overflow-hidden bg-[#fbf8f3] p-5 sm:p-7 md:p-9 rounded-[32px] border border-amber-200/60 shadow-xl space-y-5 max-w-4xl mx-auto mt-8 brands-print-page">

    <!-- Watermark -->
    <div class="watermark-layer pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden opacity-[0.06] z-0">
      <div class="w-[340px] sm:w-[420px] md:w-[480px] h-[340px] sm:h-[420px] md:h-[480px]">
        <TaliaLogo />
      </div>
    </div>

    <!-- Header: identical brand to shopping card -->
    <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-slate-800/10 pb-4">
      <!-- Left: Logo & Nutritionist -->
      <div class="flex items-center space-x-3 text-left w-full md:w-auto">
        <div class="w-14 h-14 flex-shrink-0 flex items-center justify-center drop-shadow-xs">
          <TaliaLogo />
        </div>
        <div>
          <div class="text-xs font-black tracking-widest text-slate-800 uppercase font-sans">L.N. TALIA TINOCO FABIÁN</div>
          <div class="text-[10px] tracking-[0.25em] font-extrabold text-[#6e997a] uppercase">NUTRICIÓN CLÍNICA</div>
          <div class="text-[9px] text-slate-500 font-bold">Cédula Profesional: 11290678</div>
        </div>
      </div>

      <!-- Center: Page Title -->
      <div class="text-center">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-sans">
          GUÍA DE MARCAS
        </h2>
        <div class="text-[11px] text-slate-600 font-medium">Recomendaciones según tu plan nutricional</div>
      </div>

      <!-- Right: Strategy Badge -->
      <div
        class="flex items-center space-x-2 px-4 py-2 rounded-2xl border text-xs font-bold"
        :style="{ backgroundColor: strategyMeta.bgColor, borderColor: strategyMeta.borderColor, color: strategyMeta.color }"
      >
        <span class="text-lg">{{ strategyMeta.emoji }}</span>
        <div>
          <div class="font-black text-[11px] uppercase tracking-wide">{{ strategyMeta.label }}</div>
        </div>
      </div>
    </div>

    <!-- Strategy description banner -->
    <div
      class="relative z-10 flex items-start space-x-3 px-4 py-3 rounded-2xl border"
      :style="{ backgroundColor: strategyMeta.bgColor, borderColor: strategyMeta.borderColor }"
    >
      <span class="text-2xl flex-shrink-0 mt-0.5">{{ strategyMeta.emoji }}</span>
      <div>
        <p class="text-xs font-bold leading-snug" :style="{ color: strategyMeta.color }">
          {{ strategyMeta.description }}
        </p>
        <p class="text-[10px] mt-1 font-medium text-slate-500">
          ✅ Estas marcas fueron seleccionadas por la Lic. Talia con base en el tipo de dieta prescrita.
          Los precios y disponibilidad pueden variar según tu localidad.
        </p>
      </div>
    </div>

    <!-- Grid of brand cards — 2 columns -->
    <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      <div
        v-for="cat in recommendations"
        :key="cat.categorySlug"
        class="brand-card p-4 sm:p-5 bg-white/80 border border-slate-200/80 shadow-xs"
        :style="{ borderRadius: getBlobRadius(cat.categorySlug) }"
      >
        <!-- Category header pill -->
        <div class="flex items-center justify-between mb-3">
          <div
            class="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center space-x-1.5 shadow-xs"
            :style="getCategoryPillStyle(cat.categorySlug)"
          >
            <span>{{ cat.emoji }}</span>
            <span>{{ cat.categoryName }}</span>
          </div>
          <span
            class="text-[10px] font-bold opacity-60 italic"
            :style="{ color: getCategoryTextColor(cat.categorySlug) }"
          >{{ cat.headline }}</span>
        </div>

        <!-- Brand list -->
        <ul class="space-y-2">
          <li
            v-for="brand in cat.brands"
            :key="brand.name"
            class="flex items-start space-x-2"
          >
            <span class="text-sm flex-shrink-0 mt-0.5">🏷️</span>
            <div class="flex-1">
              <span class="text-xs font-bold text-slate-800">{{ brand.name }}</span>
              <span v-if="brand.tip" class="block text-[10px] text-slate-500 font-medium italic leading-tight">
                {{ brand.tip }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer note -->
    <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/10 footer-seal-box">
      <div class="text-[10px] text-slate-500 font-medium text-center sm:text-left leading-relaxed max-w-sm">
        ⚠️ <strong>Nota:</strong> Las marcas son sugerencias orientativas. Si tienes alguna alergia o intolerancia,
        verifica siempre los ingredientes en la etiqueta del producto.
      </div>
      <div class="text-center text-[10px] font-bold text-slate-600 flex flex-col items-center">
        <span class="font-extrabold text-slate-800 uppercase tracking-wider text-xs">Lic. N. Talia Tinoco Fabián</span>
        <span class="text-[#6e997a]">Cédula Profesional: 11290678</span>
        <span class="text-slate-400 mt-0.5">Nutrición Clínica • México</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PurchaseStrategy  } from '../../types/shoppingDiet';
import { BrandRecommendationService, type CategoryBrandRecommendation } from '../../services/shopping/BrandRecommendationService';
import TaliaLogo from './TaliaLogo.vue';

const props = defineProps<{
  purchaseStrategy: PurchaseStrategy;
  /** Raw category slugs/names from the shopping result */
  categorySlugs: string[];
}>();

const strategyMeta = computed(() => BrandRecommendationService.getStrategyMeta(props.purchaseStrategy));

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
.brand-card {
  break-inside: avoid;
  page-break-inside: avoid;
}

.footer-seal-box {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Force this entire page to start on a new sheet when printing */
.brands-print-page {
  break-before: page;
  page-break-before: always;
}

@media print {
  .brands-page-container {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    background: #fbf8f3 !important;
    margin-top: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .brand-card {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .watermark-layer {
    opacity: 0.05 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
