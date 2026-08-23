<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Users, 
  Home, 
  Wrench, 
  ShoppingCart, 
  Sparkles, 
  BarChart3, 
  ArrowLeft,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  AlertCircle,
  X,
  Sun,
  Moon
} from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
import ShoppingListWizard from '../components/shopping/ShoppingListWizard.vue'
import PatientProgressWizard from '../components/progress/PatientProgressWizard.vue'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()

// Main Navigation: 'pacientes' | 'home' | 'utilities'
const currentTab = ref<'pacientes' | 'utilities'>('utilities')

// Active sub-tool within utilities: 'hub' | 'shopping-list' | 'patient-progress'
const activeTool = ref<'hub' | 'shopping-list' | 'patient-progress'>('hub')

// Modal state for coming soon features
const comingSoonModal = ref<{
  open: boolean;
  title: string;
  description: string;
  icon: any;
}>({
  open: false,
  title: '',
  description: '',
  icon: Sparkles
})

function navigateToHome() {
  router.push('/')
}

function handleTabClick(tab: 'pacientes' | 'home' | 'utilities') {
  if (tab === 'home') {
    navigateToHome()
  } else {
    currentTab.value = tab
    activeTool.value = 'hub'
  }
}

function openTool(tool: 'shopping-list' | 'diet-generator' | 'patient-progress' | 'patient-stats') {
  if (tool === 'shopping-list') {
    activeTool.value = 'shopping-list'
  } else if (tool === 'patient-progress' || tool === 'patient-stats') {
    activeTool.value = 'patient-progress'
  } else if (tool === 'diet-generator') {
    comingSoonModal.value = {
      open: true,
      title: 'Generador Inteligente de Dietas',
      description: 'Esta herramienta permitirá estructurar y crear planes alimenticios completos calculando macros automáticamente y adaptándose a las preferencias y restricciones del paciente con Inteligencia Artificial.',
      icon: Sparkles
    }
  }
}

// Sample patient list for the Pacientes tab
const patientSearch = ref('')
const samplePatients = [
  { id: '1', name: 'Laura Martínez Soto', goal: 'Pérdida de grasa', plan: 'Plan Hipocalórico 1,600 kcal', lastUpdate: 'Hoy', status: 'Activo' },
  { id: '2', name: 'Carlos Mendoza Cruz', goal: 'Hipertrofia muscular', plan: 'Plan Hiperproteico 2,400 kcal', lastUpdate: 'Ayer', status: 'Activo' },
  { id: '3', name: 'Valeria Rivas Gómez', goal: 'Recomposición corporal', plan: 'Plan Balanceado 1,850 kcal', lastUpdate: 'Hace 3 días', status: 'Seguimiento' },
  { id: '4', name: 'Diego Hernández Vega', goal: 'Rendimiento deportivo', plan: 'Plan Ciclado de Carbs 2,700 kcal', lastUpdate: 'Hace 5 días', status: 'Activo' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col transition-colors duration-200" style="background: var(--surface-container-lowest); color: var(--on-surface);">
    
    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-40 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0e0e10]/85 transition-colors no-print">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Brand & Context -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black shadow-lg" style="background: var(--kinetic-glow);">
            <Wrench class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-bold text-base tracking-wide text-slate-900 dark:text-white" style="font-family: var(--font-display);">BodyFlow</h1>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style="background: rgba(135, 255, 112, 0.15); color: var(--primary); border: 1px solid rgba(135, 255, 112, 0.3);">
                PRO HUB
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Panel de Control y Utilidades</p>
          </div>
        </div>

        <!-- Center/Right: Navigation & Theme Switcher -->
        <div class="flex items-center gap-2">
          <!-- 3 Primary Navigation Options: Pacientes, Home, Utilities -->
          <nav class="flex items-center gap-1.5 sm:gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            
            <!-- 1. Pacientes -->
            <button
              @click="handleTabClick('pacientes')"
              class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
              :class="[
                currentTab === 'pacientes'
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
              ]"
            >
              <Users class="w-4 h-4" />
              <span>Pacientes</span>
            </button>

            <!-- 2. Home -->
            <button
              @click="handleTabClick('home')"
              class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5"
              title="Ir al inicio de BodyFlow"
            >
              <Home class="w-4 h-4" />
              <span>Home</span>
            </button>

            <!-- 3. Utilities -->
            <button
              @click="handleTabClick('utilities')"
              class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
              :class="[
                currentTab === 'utilities'
                  ? 'text-black font-bold shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
              ]"
              :style="currentTab === 'utilities' ? { background: 'var(--kinetic-glow)' } : {}"
            >
              <Wrench class="w-4 h-4" />
              <span>Utilities</span>
            </button>
          </nav>

          <!-- Theme Switcher Button -->
          <button
            @click="toggleTheme"
            class="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all shadow-xs"
            :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            aria-label="Alternar tema"
          >
            <Sun v-if="isDark" class="w-5 h-5 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
            <Moon v-else class="w-5 h-5 text-indigo-600 transition-transform rotate-0 hover:-rotate-12" />
          </button>
        </div>
      </div>
    </header>


    <!-- Main Content Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      
      <!-- ============================================================ -->
      <!-- TAB 1: PACIENTES                                             -->
      <!-- ============================================================ -->
      <section v-if="currentTab === 'pacientes'" class="space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style="font-family: var(--font-display);">
              Gestión de Pacientes
            </h2>
            <p class="text-xs sm:text-sm mt-1 text-slate-500 dark:text-slate-400">
              Monitorea el progreso, planes nutricionales asignados y registros activos.
            </p>
          </div>

          <button 
            @click="openTool('diet-generator')"
            class="inline-flex items-center gap-2 px-4 py-2.5 btn-primary text-xs sm:text-sm font-bold shadow-lg"
          >
            <Plus class="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
        </div>

        <!-- Metric Badges -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4 transition-colors">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Users class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Pacientes Activos</p>
              <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">4</h3>
            </div>
          </div>

          <div class="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4 transition-colors">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <FileText class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Dietas Generadas</p>
              <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">12</h3>
            </div>
          </div>

          <div class="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4 transition-colors">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <TrendingUp class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Adherencia Media</p>
              <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">92%</h3>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative">
          <Search class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            v-model="patientSearch"
            type="text"
            placeholder="Buscar por nombre, plan u objetivo del paciente..."
            class="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
          />
        </div>

        <!-- Patient Cards List -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="p in samplePatients"
            :key="p.id"
            class="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-white/25 transition-all group cursor-pointer shadow-sm"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/20 border border-emerald-500/20 dark:border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-base">
                  {{ p.name.charAt(0) }}
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ p.name }}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ p.goal }}</p>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                {{ p.status }}
              </span>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1.5">
                <FileText class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                {{ p.plan }}
              </span>
              <span class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <Clock class="w-3.5 h-3.5" />
                {{ p.lastUpdate }}
              </span>
            </div>
          </div>
        </div>

      </section>

      <!-- ============================================================ -->
      <!-- TAB 2: UTILITIES (HUB & TOOLS)                               -->
      <!-- ============================================================ -->
      <section v-else-if="currentTab === 'utilities'" class="space-y-8">
        
        <!-- Back button if inside a tool -->
        <div v-if="activeTool !== 'hub'" class="no-print">
          <button
            @click="activeTool = 'hub'"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-bold transition-all border border-slate-200 dark:border-white/10"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Volver al Hub de Utilidades</span>
          </button>
        </div>

        <!-- HUB VIEW: The 3 Requested Options -->
        <div v-if="activeTool === 'hub'" class="space-y-8">
          
          <!-- Banner / Hero -->
          <div class="relative overflow-hidden bg-white dark:bg-white/5 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div class="relative z-10 max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase mb-3" style="background: rgba(135, 255, 112, 0.15); color: var(--primary); border: 1px solid rgba(135, 255, 112, 0.3);">
                <Sparkles class="w-3.5 h-3.5" />
                Herramientas para Profesionales
              </div>
              <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white" style="font-family: var(--font-display);">
                Módulos de Nutrición & Utilidades
              </h2>
              <p class="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Optimiza tus consultas, extrae listas de compras automáticas desde planes en PDF con IA, calcula mermas y genera fichas imprimibles para tus pacientes.
              </p>
            </div>
            
            <!-- Glow background decor -->
            <div class="absolute -right-12 -bottom-12 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style="background: var(--primary);"></div>
          </div>

          <!-- 3 Tools Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- OPTION 1: Generador de Dietas (Placeholder) -->
            <div
              @click="openTool('diet-generator')"
              class="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md"
            >
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Sparkles class="w-7 h-7" />
                  </div>
                  <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    Próximamente
                  </span>
                </div>

                <div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    Generador de Dietas
                  </h3>
                  <p class="text-xs leading-relaxed mt-2 text-slate-500 dark:text-slate-400">
                    Crea planes de alimentación a medida con Inteligencia Artificial, ajustando requerimientos calóricos, macronutrientes y distribución de comidas.
                  </p>
                </div>
              </div>

              <div class="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>En Desarrollo</span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <!-- OPTION 2: Creador de Lista de Compras (Full Nutri-flow-Utilities Module) -->
            <div
              @click="openTool('shopping-list')"
              class="bg-emerald-50/40 dark:bg-emerald-950/20 p-6 rounded-3xl border-2 border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-lg hover:shadow-xl"
            >
              <!-- Highlight indicator -->
              <div class="absolute top-0 right-0 left-0 h-1.5" style="background: var(--kinetic-glow);"></div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-black shadow-lg group-hover:scale-110 transition-transform" style="background: var(--kinetic-glow);">
                    <ShoppingCart class="w-7 h-7" />
                  </div>
                  <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
                    Disponible • IA
                  </span>
                </div>

                <div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    Creador de Lista de Compras
                  </h3>
                  <p class="text-xs leading-relaxed mt-2 text-slate-600 dark:text-slate-300">
                    Sube un PDF de dieta, detecta ingredientes con IA, calcula mermas (+10%), redondeo comercial, guía de marcas recomendadas y diseño imprimible.
                  </p>
                </div>
              </div>

              <div class="mt-6 pt-4 border-t border-emerald-200/50 dark:border-white/10 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span class="flex items-center gap-1.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Abrir Generador de Compras
                </span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <!-- OPTION 3: Avances y Progreso Clínico de Pacientes (Active Tool) -->
            <div
              @click="openTool('patient-progress')"
              class="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md"
            >
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <BarChart3 class="w-7 h-7" />
                  </div>
                  <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                    Disponible • Antropometría
                  </span>
                </div>

                <div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    Avances y Progreso Clínico
                  </h3>
                  <p class="text-xs leading-relaxed mt-2 text-slate-600 dark:text-slate-300">
                    Sube historias clínicas en Word o Excel, calcula automáticamente Durnin-Womersley y Siri, compara inicio vs. actual y genera gráficas clínicas imprimibles.
                  </p>
                </div>
              </div>

              <div class="mt-6 pt-4 border-t border-indigo-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span class="flex items-center gap-1.5">
                  <CheckCircle2 class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Abrir Analítica de Avances
                </span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

          </div>

        </div>

        <!-- ACTIVE SUB-TOOL: Shopping List Wizard -->
        <div v-else-if="activeTool === 'shopping-list'">
          <ShoppingListWizard />
        </div>

        <!-- ACTIVE SUB-TOOL: Patient Progress & Anthropometry -->
        <div v-else-if="activeTool === 'patient-progress'">
          <PatientProgressWizard />
        </div>

      </section>

    </main>

    <!-- Modal for Coming Soon Features -->
    <div
      v-if="comingSoonModal.open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div class="glass-card max-w-md w-full p-6 rounded-3xl border border-white/20 shadow-2xl relative">
        <button
          @click="comingSoonModal.open = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="text-center space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-emerald-400">
            <component :is="comingSoonModal.icon" class="w-8 h-8" />
          </div>

          <h3 class="text-xl font-bold text-white" style="font-family: var(--font-display);">
            {{ comingSoonModal.title }}
          </h3>

          <p class="text-xs leading-relaxed" style="color: var(--on-surface-muted);">
            {{ comingSoonModal.description }}
          </p>

          <div class="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-amber-300">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>Esta función estará disponible en la próxima actualización de BodyFlow.</span>
          </div>

          <button
            @click="comingSoonModal.open = false"
            class="w-full py-3 btn-primary text-xs font-bold rounded-xl"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@media print {
  header, nav, .no-print {
    display: none !important;
  }
}
</style>
