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
      error.value = 'Please select a valid PDF file.'
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
      throw new Error('PDF appears to be empty or contains no readable text.')
    }
    
    manualPrompt.value = generatePrompt(text)
    console.warn("manualPrompt ->",manualPrompt.value)
  } catch (err: any) {
    error.value = err.message || 'An unknown error occurred during processing.'
  } finally {
    isParsing.value = false
  }
}

function copyPrompt() {
  navigator.clipboard.writeText(manualPrompt.value)
  copySuccess.value = true
  setTimeout(() => copySuccess.value = false, 2000)
}

function processManualJson() {
  if (!jsonInput.value.trim()) return
  error.value = ''
  try {
    const parsedData = parseManualJson(jsonInput.value)
    
    // Auto-assign days based on name
    // Weekday map: Mon=1 … Sun=0 (JS convention)
    const WEEKDAY_SEQUENCE = [1, 2, 3, 4, 5, 6, 0] // Mon → Sat → Sun
    parsedData.forEach((day, index) => {
      const lowerName = (day.date || day.dayName || '').toLowerCase()
      const assignments: number[] = []

      // Named days (Spanish / English)
      if (lowerName.includes('lunes')    || lowerName.includes('monday'))    assignments.push(1)
      if (lowerName.includes('martes')   || lowerName.includes('tuesday'))   assignments.push(2)
      if (lowerName.includes('miércoles') || lowerName.includes('miercoles') || lowerName.includes('wednesday')) assignments.push(3)
      if (lowerName.includes('jueves')   || lowerName.includes('thursday'))  assignments.push(4)
      if (lowerName.includes('viernes')  || lowerName.includes('friday'))    assignments.push(5)
      if (lowerName.includes('sábado')   || lowerName.includes('sabado') || lowerName.includes('saturday'))  assignments.push(6)
      if (lowerName.includes('domingo')  || lowerName.includes('sunday'))    assignments.push(0)

      // Numeric pattern: "dia 1", "día 2", "day 1", etc.
      if (assignments.length === 0) {
        const match = lowerName.match(/\d+/)
        if (match) {
          const n = parseInt(match[0], 10) - 1 // 0-based
          if (n >= 0 && n < WEEKDAY_SEQUENCE.length) {
            assignments.push(WEEKDAY_SEQUENCE[n])
          }
        } else {
          // Fallback: assign sequentially by array index
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
  // Navigate back to dashboard to view plan
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
  <div class="max-w-md mx-auto w-full flex flex-col h-full bg-white min-h-[calc(100vh-64px)]">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 shadow-sm flex justify-between items-center">
      <h1 class="text-xl font-bold text-gray-900">Upload Plan</h1>
    </header>

    <div class="p-4 flex-1 pb-24 overflow-y-auto">
      
      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-50 text-red-600 text-sm rounded-xl mb-6 flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Upload Section -->
      <div v-if="!parsedPreview && !manualPrompt" class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center mt-4">
        <div class="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h2 class="text-lg font-bold text-gray-800 mb-2">Upload your PDF diet</h2>
        <p class="text-sm text-gray-500 mb-6">Select your nutritionist's PDF to extract text and generate a prompt.</p>
        
        <input 
          type="file" 
          accept=".pdf" 
          class="hidden" 
          ref="fileInput"
          @change="onFileSelected"
        />
        
        <button 
          @click="fileInput?.click()"
          class="bg-white border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 shadow-sm transition-colors mb-4"
          :disabled="isParsing"
        >
          Select PDF File
        </button>

        <div v-if="selectedFile" class="text-sm font-medium text-blue-600 bg-blue-50 py-2 px-4 rounded-lg inline-block w-full truncate">
          {{ selectedFile.name }}
        </div>
      </div>
      
      <!-- Process Button -->
      <button 
        v-if="selectedFile && !parsedPreview && !manualPrompt"
        @click="processPdf"
        class="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
        :disabled="isParsing"
      >
        <svg v-if="isParsing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isParsing ? 'Extracting Text...' : 'Generate Prompt' }}
      </button>

      <!-- Manual AI workflow -->
      <div v-if="manualPrompt && !parsedPreview" class="mt-6 space-y-4">
        <div class="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
          <p class="font-bold mb-2">Step 1: Copy this prompt to Gemini</p>
          <p class="text-xs mb-3">Paste this text into Gemini or ChatGPT to get your diet JSON.</p>
          <div class="relative">
             <textarea readonly v-model="manualPrompt" class="w-full h-32 p-3 text-xs border border-blue-200 rounded-lg bg-white resize-none focus:outline-none"></textarea>
             <button @click="copyPrompt" class="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow hover:bg-blue-700 transition">
               {{ copySuccess ? 'Copied!' : 'Copy' }}
             </button>
          </div>
        </div>

        <div class="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-100">
          <p class="font-bold mb-2">Step 2: Paste the JSON response</p>
          <p class="text-xs mb-3">Copy the output JSON from Gemini and paste it here.</p>
          <textarea v-model="jsonInput" placeholder="Paste JSON here..." class="w-full h-32 p-3 text-xs border border-emerald-200 rounded-lg bg-white resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
          <button @click="processManualJson" class="w-full mt-3 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition shadow-sm">
             Process JSON
          </button>
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="parsedPreview" class="animate-fade-in mt-4">
        <div class="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span class="font-bold block mb-1">Success! We parsed your plan.</span>
            <span class="text-sm opacity-90">Please review the extracted days below before saving.</span>
          </div>
        </div>

        <div class="space-y-6">
          <div v-for="day in parsedPreview" :key="day.date" class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 class="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">{{ day.date }}</h3>
            
            <div class="space-y-3">
              <div v-for="meal in day.meals" :key="meal.id" class="bg-gray-50 rounded-xl p-3">
                <input 
                  v-model="meal.name" 
                  class="font-semibold text-gray-800 bg-transparent border-b border-dashed border-gray-300 focus:border-emerald-500 outline-none w-full mb-1 transition-colors"
                  placeholder="Meal Name"
                />
                <div v-if="meal.plannedMacros" class="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                  <span class="bg-white px-2 py-1 rounded shadow-sm">{{ meal.plannedMacros.calories }} kcal</span>
                  <span class="bg-white px-2 py-1 rounded shadow-sm">P: {{ meal.plannedMacros.protein }}g</span>
                  <span class="bg-white px-2 py-1 rounded shadow-sm">C: {{ meal.plannedMacros.carbs }}g</span>
                  <span class="bg-white px-2 py-1 rounded shadow-sm">F: {{ meal.plannedMacros.fat }}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Bottom Action Bar for Preview -->
    <div v-if="parsedPreview" class="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:max-w-md md:mx-auto flex gap-3">
      <button 
        @click="discardPlan"
        class="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors"
      >
        Discard
      </button>
      <button 
        @click="savePlan"
        class="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-sm"
      >
        Save Plan
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
