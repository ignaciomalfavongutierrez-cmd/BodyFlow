<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { extractTextFromPDF } from '../services/pdfParser'
import { generatePrompt, parseManualJson } from '../services/aiParser'
import { useDietStore, type DayPlan } from '../stores/diet'

const router = useRouter()
const dietStore = useDietStore()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const isParsing = ref(false)
const error = ref('')

const parsedPreview = ref<DayPlan[] | null>(null)

// Manual workflow state
const manualPrompt = ref('')
const jsonInput = ref('')
const copySuccess = ref(false)

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type !== 'application/pdf') {
      error.value = 'Por favor selecciona un archivo PDF válido.'
      selectedFile.value = null
      return
    }
    selectedFile.value = file
    error.value = ''
    manualPrompt.value = ''
    jsonInput.value = ''
  }
}

async function processPdf() {
  if (!selectedFile.value) return
  
  isParsing.value = true
  error.value = ''
  parsedPreview.value = null
  
  try {
    const text = await extractTextFromPDF(selectedFile.value)
    
    if (!text || text.length < 50) {
      throw new Error('El PDF parece estar vacío o no contiene texto legible.')
    }
    
    manualPrompt.value = generatePrompt(text)
  } catch (err: any) {
    error.value = err.message || 'Ocurrió un error desconocido al procesar el archivo.'
  } finally {
    isParsing.value = false
  }
}

function copyPrompt() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(manualPrompt.value)
  } else {
    const textArea = document.createElement("textarea")
    textArea.value = manualPrompt.value
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (err) {
      console.error('Fallback copy failed', err)
    }
    document.body.removeChild(textArea)
  }
  copySuccess.value = true
  setTimeout(() => copySuccess.value = false, 2000)
}

function processManualJson() {
  if (!jsonInput.value.trim()) return
  error.value = ''
  try {
    const parsedData = parseManualJson(jsonInput.value)
    
    const WEEKDAY_SEQUENCE = [1, 2, 3, 4, 5, 6, 0] // Lun → Sáb → Dom
    parsedData.forEach((day, index) => {
      const lowerName = (day.date || day.dayName || '').toLowerCase()
      const assignments: number[] = []

      if (lowerName.includes('lunes')    || lowerName.includes('monday'))    assignments.push(1)
      if (lowerName.includes('martes')   || lowerName.includes('tuesday'))   assignments.push(2)
      if (lowerName.includes('miércoles') || lowerName.includes('miercoles') || lowerName.includes('wednesday')) assignments.push(3)
      if (lowerName.includes('jueves')   || lowerName.includes('thursday'))  assignments.push(4)
      if (lowerName.includes('viernes')  || lowerName.includes('friday'))    assignments.push(5)
      if (lowerName.includes('sábado')   || lowerName.includes('sabado') || lowerName.includes('saturday'))  assignments.push(6)
      if (lowerName.includes('domingo')  || lowerName.includes('sunday'))    assignments.push(0)

      if (assignments.length === 0) {
        const match = lowerName.match(/\d+/)
        if (match) {
          const n = parseInt(match[0], 10) - 1
          if (n >= 0 && n < WEEKDAY_SEQUENCE.length) {
            assignments.push(WEEKDAY_SEQUENCE[n])
          }
        } else {
          assignments.push(WEEKDAY_SEQUENCE[index % WEEKDAY_SEQUENCE.length])
        }
      }

      day.assignedDays = assignments
    })
    
    parsedPreview.value = parsedData
  } catch(err: any) {
    error.value = err.message
  }
}

function savePlan() {
  if (!parsedPreview.value) return
  
  dietStore.setDiet(parsedPreview.value)
  router.push('/')
}

function discardPlan() {
  parsedPreview.value = null
  selectedFile.value = null
  manualPrompt.value = ''
  jsonInput.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="max-w-md mx-auto w-full flex flex-col h-full min-h-[calc(100vh-64px)]" style="background: var(--surface-container-lowest);">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-10 px-4 py-4 backdrop-blur-md" style="background: rgba(14, 14, 16, 0.8); border-bottom: 1px solid var(--glass-border);">
      <h1 class="text-xl font-bold" style="font-family: var(--font-display); color: var(--on-surface);">Cargar Plan</h1>
    </header>

    <div class="p-4 flex-1 pb-24 overflow-y-auto">
      
      <!-- Error Message -->
      <div v-if="error" class="p-4 rounded-xl mb-6 flex items-start" style="background: var(--error-container); color: var(--error); border: 1px solid rgba(255, 180, 171, 0.15);">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs font-semibold">{{ error }}</span>
      </div>

      <!-- Upload Section -->
      <div v-if="!parsedPreview && !manualPrompt" class="border-2 border-dashed rounded-3xl p-8 text-center mt-4 transition-all" style="background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)); border-color: var(--glass-border);">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background: rgba(25, 232, 13, 0.1); color: var(--primary);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h2 class="text-lg font-bold mb-2" style="font-family: var(--font-display); color: var(--on-surface);">Sube tu dieta en PDF</h2>
        <p class="text-sm mb-6" style="color: var(--on-surface-muted);">Selecciona el PDF de tu nutriólogo para extraer el texto y generar el prompt.</p>
        
        <input 
          type="file" 
          accept=".pdf" 
          class="hidden" 
          ref="fileInput"
          @change="onFileSelected"
        />
        
        <button 
          @click="fileInput?.click()"
          class="px-6 py-3 btn-secondary text-sm mb-4"
          :disabled="isParsing"
        >
          Seleccionar Archivo PDF
        </button>

        <div v-if="selectedFile" class="text-xs font-bold py-2.5 px-4 rounded-lg inline-block w-full truncate" style="background: rgba(25, 232, 13, 0.1); color: var(--primary);">
          {{ selectedFile.name }}
        </div>
      </div>
      
      <!-- Process Button -->
      <button 
        v-if="selectedFile && !parsedPreview && !manualPrompt"
        @click="processPdf"
        class="w-full mt-6 py-4 btn-primary text-lg flex justify-center items-center shadow-md"
        :disabled="isParsing"
      >
        <svg v-if="isParsing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isParsing ? 'Extrayendo Texto...' : 'Generar Prompt' }}
      </button>

      <!-- Manual AI workflow -->
      <div v-if="manualPrompt && !parsedPreview" class="mt-6 space-y-5">
        <div class="p-4 rounded-xl text-sm border" style="background: var(--glass-bg); border-color: var(--glass-border);">
          <p class="font-bold mb-2 text-sm" style="color: var(--primary);">Paso 1: Copia este prompt a Gemini / IA</p>
          <p class="text-xs mb-3" style="color: var(--on-surface-muted);">Pega este texto en Gemini o ChatGPT para que compute y estructure tu dieta en JSON.</p>
          <div class="relative">
             <textarea readonly v-model="manualPrompt" class="w-full h-32 p-3 text-xs border rounded-lg resize-none focus:outline-none" style="background: rgba(0,0,0,0.2); border-color: var(--glass-border); color: var(--on-surface-variant);"></textarea>
             <button @click="copyPrompt" class="absolute top-2 right-2 btn-primary px-3 py-1.5 text-xs">
               {{ copySuccess ? '¡Copiado!' : 'Copiar' }}
             </button>
          </div>
        </div>

        <div class="p-4 rounded-xl text-sm border" style="background: var(--glass-bg); border-color: var(--glass-border);">
          <p class="font-bold mb-2 text-sm" style="color: var(--secondary);">Paso 2: Pega la respuesta JSON</p>
          <p class="text-xs mb-3" style="color: var(--on-surface-muted);">Copia la respuesta JSON generada por la IA y pégala aquí.</p>
          <textarea v-model="jsonInput" placeholder="Pega el JSON aquí..." class="w-full h-32 p-3 text-xs border rounded-lg resize-y focus:outline-none input-field" style="font-family: monospace;"></textarea>
          <button @click="processManualJson" class="w-full mt-3 btn-primary py-3">
             Procesar JSON
          </button>
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="parsedPreview" class="animate-fade-in mt-4">
        <div class="p-4 rounded-xl mb-6 flex items-start" style="background: rgba(25, 232, 13, 0.15); color: var(--primary); border: 1px solid rgba(25, 232, 13, 0.25);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span class="font-bold block mb-1">¡Plan procesado con éxito!</span>
            <span class="text-xs opacity-90">Por favor revisa y edita los días extraídos abajo antes de guardarlo.</span>
          </div>
        </div>

        <div class="space-y-6">
          <div v-for="day in parsedPreview" :key="day.date" class="glass-card p-4">
            <h3 class="font-bold border-b pb-2 mb-3" style="font-family: var(--font-display); color: var(--on-surface); border-color: var(--glass-border);">{{ day.date }}</h3>
            
            <div class="space-y-3">
              <div v-for="meal in day.meals" :key="meal.id" class="p-3 rounded-xl" style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);">
                <input 
                  v-model="meal.name" 
                  class="font-semibold bg-transparent border-b border-dashed focus:border-emerald-500 outline-none w-full mb-1 transition-colors text-sm"
                  style="color: var(--on-surface); border-color: var(--outline);"
                  placeholder="Nombre de la comida"
                />
                <div v-if="meal.plannedMacros" class="flex flex-wrap gap-2 text-[10px] mt-2" style="color: var(--on-surface-muted);">
                  <span class="px-2 py-1 rounded" style="background: rgba(0,0,0,0.25);">{{ meal.plannedMacros.calories }} kcal</span>
                  <span class="px-2 py-1 rounded" style="background: rgba(0,0,0,0.25);">P: {{ meal.plannedMacros.protein }}g</span>
                  <span class="px-2 py-1 rounded" style="background: rgba(0,0,0,0.25);">C: {{ meal.plannedMacros.carbs }}g</span>
                  <span class="px-2 py-1 rounded" style="background: rgba(0,0,0,0.25);">F: {{ meal.plannedMacros.fat }}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Bottom Action Bar for Preview -->
    <div v-if="parsedPreview" class="fixed bottom-16 left-0 right-0 p-4 border-t shadow-lg md:max-w-md md:mx-auto flex gap-3 backdrop-blur-md" style="background: rgba(14, 14, 16, 0.85); border-top: 1px solid var(--glass-border);">
      <button 
        @click="discardPlan"
        class="flex-1 py-4 btn-secondary text-lg"
      >
        Descartar
      </button>
      <button 
        @click="savePlan"
        class="flex-1 py-4 btn-primary text-lg"
      >
        Guardar Plan
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
