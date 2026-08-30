<template>
  <div class="stylized-shopping-container relative overflow-hidden bg-[#fbf8f3] p-5 sm:p-7 md:p-9 rounded-[32px] border border-amber-200/60 shadow-xl space-y-5 max-w-4xl mx-auto print-letter-card">
    
    <!-- Watermark Official Logo Image Layer (Centered, Subtle & Clean) -->
    <div class="watermark-layer pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden opacity-[0.045] z-0">
      <div class="w-[340px] sm:w-[420px] md:w-[480px] h-[340px] sm:h-[420px] md:h-[480px]">
        <TaliaLogo :watermark="true" />
      </div>
    </div>

    <!-- Top Patient Name Bar (Clean & Focused) -->
    <div class="relative z-10 flex items-center bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-amber-200/60 shadow-xs">
      <div class="flex items-center space-x-2 w-full">
        <span class="text-base flex-shrink-0">👤</span>
        <label class="text-xs font-bold text-slate-700 whitespace-nowrap flex-shrink-0">Paciente:</label>
        <input
          type="text"
          v-model="patientName"
          placeholder="Escribe el nombre del paciente (ej: Adair Iguano)..."
          class="no-print w-full text-xs font-semibold text-slate-800 bg-amber-50/40 border border-amber-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-nutrition-500 focus:bg-white transition-all"
        />
        <!-- Print-only patient name -->
        <span class="hidden print-patient-name text-xs font-black text-slate-800 uppercase tracking-wide">
          {{ patientName || 'Plan Personalizado' }}
        </span>
      </div>
    </div>

    <!-- Header Section -->
    <div class="relative z-10 flex items-center justify-between gap-4 border-b-2 border-slate-800/10 pb-3">
      <div class="text-left">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight font-sans">
          LISTA DE COMPRAS
        </h1>
        <div class="text-[11px] text-slate-600 font-medium">
          <span v-if="patientName" class="font-bold text-nutrition-700 uppercase">Para: {{ patientName }} • </span>
          <span>Plan Nutricional Saludable</span>
        </div>
      </div>

      <!-- Right: Modern unDraw-style Grocery Basket -->
      <div class="flex items-center justify-end w-14 h-14 shrink-0">
        <svg viewBox="0 0 100 100" class="w-12 h-12 drop-shadow-xs">
          <!-- Paper Bag -->
          <path d="M24 38 L29 88 C29 91 32 93 35 93 L65 93 C68 93 71 91 71 88 L76 38 Z" fill="#dfa86c" />
          <path d="M29 38 L34 93 L66 93 L71 38 Z" fill="#cf9456" opacity="0.3" />
          <path d="M22 38 L78 38 L74 34 L26 34 Z" fill="#bd8245" />
          <!-- Groceries -->
          <!-- Carrot -->
          <path d="M54 34 L66 12 L71 16 L60 36 Z" fill="#f97316" />
          <path d="M66 12 L70 4 M68 12 L73 6 M65 10 L63 3" stroke="#22c55e" stroke-width="2" stroke-linecap="round" />
          <!-- Bread -->
          <path d="M40 34 L46 8 C47 5 52 5 54 8 L57 34 Z" fill="#eab308" />
          <!-- Eggplant -->
          <ellipse cx="33" cy="29" rx="6" ry="9" transform="rotate(-15 33 29)" fill="#7e22ce" />
          <path d="M31 20 C33 18 36 18 37 21 C34 22 32 22 31 20 Z" fill="#15803d" />
        </svg>
      </div>
    </div>

    <!-- Standardized Clinical Contact & Official Logo Banner -->
    <div class="relative z-10">
      <TaliaClinicalBanner :logoSize="90" />
    </div>

    <!-- Subheader / Date & Info Bar -->
    <div class="relative z-10 flex flex-wrap items-center justify-between text-xs font-bold text-slate-700 bg-amber-100/40 px-4 py-2 rounded-2xl border border-amber-200/40">
      <div class="flex items-center space-x-2">
        <span class="text-slate-900 font-extrabold uppercase tracking-wider text-[11px]">DÍAS:</span>
        <span class="text-slate-800 font-bold uppercase tracking-wide text-xs">
          {{ formattedDayLabel }}
        </span>
      </div>
      <div class="text-[11px] text-slate-500 font-medium">
        Dieta: <strong class="text-slate-700">{{ result.diet_name }}</strong>
        <span v-if="patientName" class="ml-2 font-bold text-nutrition-700">| Paciente: {{ patientName }}</span>
      </div>
    </div>

    <!-- Stylized Modern Organic Blobs Grid (2 Columns) -->
    <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
      
      <!-- Column 1 -->
      <div class="space-y-4 sm:space-y-5">
        <template v-for="cat in column1Categories" :key="cat.slug">
          <div
            v-if="cat.items.length > 0"
            class="category-blob-card p-4 sm:p-5 shadow-xs border transition-all duration-300 hover:shadow-md"
            :style="{
              backgroundColor: cat.theme.bg,
              borderColor: cat.theme.border,
              borderRadius: cat.theme.borderRadius,
            }"
          >
            <!-- Category Title Pill with Organic Glow -->
            <div class="flex items-center justify-between mb-2.5">
              <div
                class="px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase text-center shadow-xs border border-white/40 flex items-center space-x-1.5"
                :style="{ backgroundColor: cat.theme.pillBg, color: cat.theme.textColor }"
              >
                <span>{{ cat.theme.emoji }}</span>
                <span>{{ cat.name }}</span>
              </div>
              <span class="text-[10px] font-bold opacity-60" :style="{ color: cat.theme.textColor }">
                {{ cat.items.length }} {{ cat.items.length === 1 ? 'ítem' : 'ítems' }}
              </span>
            </div>

            <!-- Items List with clean bullets -->
            <ul class="space-y-1.5 text-xs sm:text-[13px] font-medium leading-snug" :style="{ color: cat.theme.textColor }">
              <li
                v-for="item in cat.items"
                :key="item.id"
                class="flex items-start"
              >
                <span class="mr-1.5 select-none text-base leading-none opacity-70">•</span>
                <span class="flex-1">
                  <strong class="font-bold">{{ item.name }}:</strong>
                  <span class="ml-1 opacity-90">{{ item.qtyText }}</span>
                  <span v-if="item.notes" class="text-[10px] opacity-75 block italic leading-tight">({{ item.notes }})</span>
                </span>
              </li>
            </ul>
          </div>
        </template>
      </div>

      <!-- Column 2 -->
      <div class="space-y-4 sm:space-y-5">
        <template v-for="cat in column2Categories" :key="cat.slug">
          <div
            v-if="cat.items.length > 0"
            class="category-blob-card p-4 sm:p-5 shadow-xs border transition-all duration-300 hover:shadow-md"
            :style="{
              backgroundColor: cat.theme.bg,
              borderColor: cat.theme.border,
              borderRadius: cat.theme.borderRadius,
            }"
          >
            <!-- Category Title Pill with Organic Glow -->
            <div class="flex items-center justify-between mb-2.5">
              <div
                class="px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase text-center shadow-xs border border-white/40 flex items-center space-x-1.5"
                :style="{ backgroundColor: cat.theme.pillBg, color: cat.theme.textColor }"
              >
                <span>{{ cat.theme.emoji }}</span>
                <span>{{ cat.name }}</span>
              </div>
              <span class="text-[10px] font-bold opacity-60" :style="{ color: cat.theme.textColor }">
                {{ cat.items.length }} {{ cat.items.length === 1 ? 'ítem' : 'ítems' }}
              </span>
            </div>

            <!-- Items List with clean bullets -->
            <ul class="space-y-1.5 text-xs sm:text-[13px] font-medium leading-snug" :style="{ color: cat.theme.textColor }">
              <li
                v-for="item in cat.items"
                :key="item.id"
                class="flex items-start"
              >
                <span class="mr-1.5 select-none text-base leading-none opacity-70">•</span>
                <span class="flex-1">
                  <strong class="font-bold">{{ item.name }}:</strong>
                  <span class="ml-1 opacity-90">{{ item.qtyText }}</span>
                  <span v-if="item.notes" class="text-[10px] opacity-75 block italic leading-tight">({{ item.notes }})</span>
                </span>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>

    <!-- Bottom Footer Section: unDraw Shopper & Personalized Motivational Quote -->
    <div class="relative z-10 pt-3 border-t border-slate-800/10 flex flex-col sm:flex-row items-center justify-between gap-3 footer-seal-box">
      <!-- Shopper Illustration & Professional Seal -->
      <div class="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-start">
        <div class="w-13 h-13 flex-shrink-0">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <!-- Modern unDraw style shopping character -->
            <!-- Wheels -->
            <circle cx="58" cy="85" r="4.5" fill="#1e293b" />
            <circle cx="82" cy="85" r="4.5" fill="#1e293b" />
            <circle cx="58" cy="85" r="1.8" fill="#94a3b8" />
            <circle cx="82" cy="85" r="1.8" fill="#94a3b8" />
            <!-- Basket -->
            <path d="M52 56 L88 56 L82 78 L56 78 Z" fill="#93c5fd" opacity="0.4" />
            <path d="M52 56 L88 56 L82 78 L56 78 Z" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linejoin="round" />
            <line x1="62" y1="56" x2="64" y2="78" stroke="#2563eb" stroke-width="1.2" />
            <line x1="72" y1="56" x2="73" y2="78" stroke="#2563eb" stroke-width="1.2" />
            <!-- Frame -->
            <path d="M46 50 L52 56 L58 80 L84 80" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="45" cy="49" r="2.2" fill="#ef4444" />
            <!-- Groceries -->
            <circle cx="64" cy="52" r="4.5" fill="#ef4444" />
            <path d="M72 46 L78 54 L70 54 Z" fill="#eab308" />
            <rect x="76" y="48" width="6" height="8" rx="1.5" fill="#3b82f6" />
            <!-- Character -->
            <circle cx="28" cy="28" r="8.5" fill="#fed7aa" />
            <path d="M22 28 C22 18 36 16 36 24 C34 22 26 22 24 28 Z" fill="#334155" />
            <path d="M22 37 C22 37 28 35 34 37 L38 58 L18 58 Z" fill="#10b981" />
            <path d="M30 42 L45 49" stroke="#fed7aa" stroke-width="3" stroke-linecap="round" />
            <path d="M22 58 L16 88 M32 58 L38 88" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round" />
            <ellipse cx="14" cy="89" rx="4.5" ry="2" fill="#0f172a" />
            <ellipse cx="40" cy="89" rx="4.5" ry="2" fill="#0f172a" />
          </svg>
        </div>
        <div class="text-[10px] text-slate-600 leading-tight">
          <span class="font-extrabold text-slate-800 uppercase tracking-wider block">Lic. N. Talia Tinoco Fabián</span>
          <span class="text-nutrition-700 font-bold">Cédula Profesional: 11290678</span>
        </div>
      </div>

      <!-- Personalized Motivational Quote -->
      <div class="flex items-center space-x-2.5 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-amber-200/70 shadow-xs max-w-sm">
        <span class="text-xl select-none">💪</span>
        <div class="text-right sm:text-left">
          <p class="text-xs font-black text-slate-800 italic tracking-tight">
            “{{ currentPersonalizedQuote }}”
          </p>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            Mensaje de tu nutrióloga
          </span>
        </div>
        <button
          @click="shuffleQuote"
          type="button"
          class="no-print p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xs transition-colors"
          title="Cambiar frase motivadora"
        >
          🔄
        </button>
      </div>
    </div>

  </div>

  <!-- ─── Segunda página: Guía de Marcas (se imprime al reverso) ─── -->
  <BrandRecommendationsPage
    :purchase-strategy="result.purchase_strategy"
    :category-slugs="allCategorySlugs"
  />

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ShoppingListCalculationResult  } from '../../types/shoppingDiet';
import TaliaLogo from './TaliaLogo.vue';
import TaliaClinicalBanner from '../common/TaliaClinicalBanner.vue';
import BrandRecommendationsPage from './BrandRecommendationsPage.vue';

const props = defineProps<{
  result: ShoppingListCalculationResult;
  initialPatientName?: string;
}>();

const patientName = ref(props.initialPatientName || '');

// Inspiring quote templates supporting personalization with patient name
const quoteTemplates = [
  (name: string) => name ? `¡Vamos ${name}, disciplina hoy, resultados mañana!` : 'Disciplina hoy, resultados mañana.',
  (name: string) => name ? `${name}, tu cuerpo es tu templo: cuídalo, nútrelo y respétalo.` : 'Tu cuerpo es tu templo: cuídalo, nútrelo y respétalo.',
  (name: string) => name ? `${name}, pequeños hábitos diarios construyen grandes transformaciones.` : 'Pequeños hábitos diarios construyen grandes transformaciones.',
  (name: string) => name ? `${name}, la salud no se compra, se cultiva día con día.` : 'La salud no se compra, se cultiva día con día.',
  (name: string) => name ? `${name}, cada comida saludable es una decisión de amor propio.` : 'Comer saludable es tu mejor acto de amor propio.',
  (name: string) => name ? `¡${name}, la constancia siempre supera la motivación pasajera!` : 'La constancia siempre supera la motivación pasajera.',
  (name: string) => name ? `${name}, cada elección nutritiva te acerca a tu mejor versión.` : 'Cada elección nutritiva te acerca a tu mejor versión.',
  (name: string) => name ? `¡Adelante ${name}, el esfuerzo de hoy es tu bienestar de mañana!` : 'El esfuerzo de hoy es el bienestar del mañana.'
];

const currentQuoteIndex = ref(0);
const currentPersonalizedQuote = computed(() => {
  const template = quoteTemplates[currentQuoteIndex.value % quoteTemplates.length];
  const trimmed = patientName.value.trim();
  const firstName = trimmed ? trimmed.split(' ')[0] : '';
  return template(firstName);
});

function shuffleQuote() {
  currentQuoteIndex.value = (currentQuoteIndex.value + 1) % quoteTemplates.length;
}

const formattedDayLabel = computed(() => {
  const mult = props.result.cycle_multiplier || 1;
  const totalDays = props.result.total_days_planned || (props.result.selected_days.length * mult);
  const multSuffix = mult > 1 ? ` — PLAN ${totalDays} DÍAS (×${mult} CICLOS)` : ` — (${props.result.selected_days.length} DÍAS)`;

  if (props.result.selected_days && props.result.selected_days.length > 0) {
    if (props.result.selected_days.length === 1) {
      return `DÍA ${props.result.selected_days[0]}${multSuffix}`;
    }
    return `DÍAS ${props.result.selected_days.join(', ')}${multSuffix}`;
  }
  return props.result.generated_at.toUpperCase();
});

// Modern Organic Blob Curves & Pastel Color Palettes
const CATEGORY_THEMES: Record<string, {
  bg: string;
  border: string;
  pillBg: string;
  textColor: string;
  emoji: string;
  borderRadius: string;
}> = {
  proteina: {
    bg: 'linear-gradient(135deg, #fae0e4 0%, #f9ced4 100%)',
    border: '#f3b4be',
    pillBg: '#f2a8b5',
    textColor: '#5e1d24',
    emoji: '🥩',
    borderRadius: '30px 20px 34px 22px / 24px 32px 22px 30px',
  },
  cereales: {
    bg: 'linear-gradient(135deg, #fef0f2 0%, #fce1e4 100%)',
    border: '#f8c8d0',
    pillBg: '#f7bcc5',
    textColor: '#5f2631',
    emoji: '🌾',
    borderRadius: '24px 34px 22px 32px / 32px 22px 34px 24px',
  },
  frutas: {
    bg: 'linear-gradient(135deg, #eae4f6 0%, #ded6ef 100%)',
    border: '#c8bcde',
    pillBg: '#c1b3da',
    textColor: '#3d2b63',
    emoji: '🍎',
    borderRadius: '32px 22px 28px 34px / 26px 34px 24px 32px',
  },
  lacteos: {
    bg: 'linear-gradient(135deg, #d8f3fe 0%, #c2ecfd 100%)',
    border: '#a3def9',
    pillBg: '#96d8f7',
    textColor: '#154868',
    emoji: '🥛',
    borderRadius: '26px 34px 24px 32px / 32px 24px 34px 26px',
  },
  verduras: {
    bg: 'linear-gradient(135deg, #dcf0b8 0%, #cce89a 100%)',
    border: '#b7d87c',
    pillBg: '#afd370',
    textColor: '#334e12',
    emoji: '🥦',
    borderRadius: '32px 24px 34px 22px / 24px 34px 22px 32px',
  },
  grasas: {
    bg: 'linear-gradient(135deg, #fde8d9 0%, #fcdbc3 100%)',
    border: '#f7c29e',
    pillBg: '#f5b78f',
    textColor: '#6d3513',
    emoji: '🥑',
    borderRadius: '22px 34px 26px 32px / 32px 24px 32px 26px',
  },
  leguminosas: {
    bg: 'linear-gradient(135deg, #fef6cc 0%, #fdf0b4 100%)',
    border: '#fae388',
    pillBg: '#f9dc75',
    textColor: '#5c4d0a',
    emoji: '🫘',
    borderRadius: '28px 22px 32px 24px / 24px 32px 24px 30px',
  },
  otros: {
    bg: 'linear-gradient(135deg, #fef0d4 0%, #fde7bf 100%)',
    border: '#f5d496',
    pillBg: '#f3cc86',
    textColor: '#64440f',
    emoji: '🛒',
    borderRadius: '24px 30px 22px 34px / 32px 22px 32px 24px',
  },
};

interface FormattedItem {
  id: string;
  name: string;
  qtyText: string;
  notes: string | null;
}

interface FormattedCategory {
  name: string;
  slug: string;
  theme: typeof CATEGORY_THEMES[string];
  items: FormattedItem[];
}

const allFormattedCategories = computed(() => {
  const map: Record<string, FormattedCategory> = {
    proteina: {
      name: 'PROTEÍNAS',
      slug: 'proteina',
      theme: CATEGORY_THEMES.proteina,
      items: [],
    },
    cereales: {
      name: 'CEREALES',
      slug: 'cereales',
      theme: CATEGORY_THEMES.cereales,
      items: [],
    },
    frutas: {
      name: 'FRUTAS',
      slug: 'frutas',
      theme: CATEGORY_THEMES.frutas,
      items: [],
    },
    lacteos: {
      name: 'LÁCTEOS',
      slug: 'lacteos',
      theme: CATEGORY_THEMES.lacteos,
      items: [],
    },
    verduras: {
      name: 'VERDURAS',
      slug: 'verduras',
      theme: CATEGORY_THEMES.verduras,
      items: [],
    },
    grasas: {
      name: 'GRASAS',
      slug: 'grasas',
      theme: CATEGORY_THEMES.grasas,
      items: [],
    },
    leguminosas: {
      name: 'LEGUMINOSAS',
      slug: 'leguminosas',
      theme: CATEGORY_THEMES.leguminosas,
      items: [],
    },
    otros: {
      name: 'OTROS',
      slug: 'otros',
      theme: CATEGORY_THEMES.otros,
      items: [],
    },
  };

  // Populate from result.categories
  for (const catGroup of props.result.categories) {
    const nameLower = catGroup.category.name.toLowerCase();
    let targetKey = 'otros';

    if (nameLower.includes('prot')) targetKey = 'proteina';
    else if (nameLower.includes('cereal')) targetKey = 'cereales';
    else if (nameLower.includes('fruta')) targetKey = 'frutas';
    else if (nameLower.includes('lact') || nameLower.includes('láct')) targetKey = 'lacteos';
    else if (nameLower.includes('verdura')) targetKey = 'verduras';
    else if (nameLower.includes('grasa')) targetKey = 'grasas';
    else if (nameLower.includes('legum')) targetKey = 'leguminosas';

    for (const item of catGroup.items) {
      let qty = item.purchase_quantity;
      if (!qty || qty === '1 unidad') {
        if (item.calculated_quantity !== null) {
          qty = `${item.quantity_with_waste || item.calculated_quantity} ${item.unit}`;
        } else {
          qty = item.notes || 'al gusto';
        }
      }

      map[targetKey].items.push({
        id: item.id,
        name: item.normalized_name,
        qtyText: qty,
        notes: item.notes,
      });
    }
  }

  // Populate unspecified items
  for (const item of props.result.unspecified_items) {
    map['otros'].items.push({
      id: item.id,
      name: item.normalized_name,
      qtyText: item.notes || 'al gusto',
      notes: null,
    });
  }

  return map;
});

// Distribute categories into 2 balanced columns matching Canva/Infographic layout
const column1Categories = computed(() => {
  const cats = allFormattedCategories.value;
  return [cats.proteina, cats.cereales, cats.frutas].filter(Boolean);
});

const column2Categories = computed(() => {
  const cats = allFormattedCategories.value;
  return [cats.lacteos, cats.verduras, cats.grasas, cats.otros, cats.leguminosas].filter(Boolean);
});

// Collect all category slugs present in the result for BrandRecommendationsPage
const allCategorySlugs = computed(() =>
  props.result.categories.map((cg) => cg.category.slug ?? cg.category.name.toLowerCase())
);
</script>

<style scoped>
/* Print & Letter Page Optimization */
@page {
  size: letter portrait;
  margin: 10mm 12mm;
}

.category-blob-card {
  break-inside: avoid;
  page-break-inside: avoid;
}

@media print {
  .no-print {
    display: none !important;
  }

  .print-patient-name {
    display: inline-block !important;
  }

  .stylized-shopping-container {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    background: #fbf8f3 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .category-blob-card {
    box-shadow: none !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .footer-seal-box {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
}
</style>
