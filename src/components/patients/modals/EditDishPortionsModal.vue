<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
    <div class="max-w-4xl w-full p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl relative my-6 bg-white dark:bg-[#18181b] text-slate-900 dark:text-white transition-all space-y-4">
      
      <!-- Botón de Cierre -->
      <button
        type="button"
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        title="Cerrar"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Encabezado del Modal -->
      <div class="border-b border-slate-100 dark:border-white/10 pb-3 pr-8 space-y-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <SlidersHorizontal class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white">
              Personalizar Platillo y Porciones
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ajusta el nombre, cantidades o sustituye ingredientes para <strong class="text-emerald-600 dark:text-emerald-400">{{ dayName }}</strong>.
            </p>
          </div>
        </div>

        <!-- Campo Editable para el Nombre del Platillo / Comida -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nombre de la Comida / Platillo
            </label>
            <span class="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Puedes renombrar el platillo</span>
          </div>
          <input
            v-model="dishName"
            type="text"
            placeholder="Ej. Batido de fresas con leche entera..."
            class="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 focus:border-emerald-500 rounded-xl text-xs sm:text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
          />
        </div>
      </div>

      <!-- Live Dynamic Macros Comparator Bar -->
      <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Macros Totales del Platillo</span>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-slate-500">Original: {{ originalMacros.calories }} kcal</span>
            <span 
              class="text-[10px] font-black px-2 py-0.5 rounded-md"
              :class="totalKcalDiff === 0 ? 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300' : (totalKcalDiff < 0 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300')"
            >
              {{ totalKcalDiff > 0 ? `+${totalKcalDiff} kcal` : (totalKcalDiff < 0 ? `${totalKcalDiff} kcal` : 'Sin variación') }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="p-2.5 rounded-xl bg-white dark:bg-[#201f22] border border-slate-200 dark:border-white/10 shadow-2xs">
            <span class="block text-[9px] uppercase font-bold text-slate-400">Calorías</span>
            <span class="text-sm sm:text-base font-black text-slate-900 dark:text-white">{{ recalculatedMacros.calories }} kcal</span>
          </div>
          <div class="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20 shadow-2xs">
            <span class="block text-[9px] uppercase font-bold text-blue-500">Proteína</span>
            <span class="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">{{ recalculatedMacros.protein }}g</span>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 shadow-2xs">
            <span class="block text-[9px] uppercase font-bold text-amber-500">Carbos</span>
            <span class="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">{{ recalculatedMacros.carbs }}g</span>
          </div>
          <div class="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 shadow-2xs">
            <span class="block text-[9px] uppercase font-bold text-rose-500">Grasas</span>
            <span class="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">{{ recalculatedMacros.fat }}g</span>
          </div>
        </div>
      </div>

      <!-- Ingredients List & Rich Editor -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Ingredientes y Porciones ({{ editableIngredients.length }})
          </label>
          <span class="text-[10px] text-slate-400">Edita el número, elige una fracción rápida o cambia la unidad de medida</span>
        </div>

        <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          <div
            v-for="(ing, idx) in editableIngredients"
            :key="ing.id || idx"
            class="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-emerald-500/30 transition-all shadow-2xs"
          >
            <!-- 1. Left: Ingredient Name, Gram Equivalent Badge & Mini Macros -->
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-xs text-slate-900 dark:text-white">{{ ing.nombre }}</span>
                <span 
                  class="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0"
                  title="Gramaje real aproximado estimado por el SMAE"
                >
                  ≈ {{ ing.gramosEquivalentes || 50 }} g
                </span>
              </div>
              <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span class="text-slate-800 dark:text-slate-200 font-extrabold">{{ ing.macros.calories }} kcal</span>
                <span class="text-blue-500 font-bold">{{ ing.macros.protein }}g P</span>
                <span class="text-amber-500 font-bold">{{ ing.macros.carbs }}g C</span>
                <span class="text-rose-500 font-bold">{{ ing.macros.fat }}g G</span>
              </div>
            </div>

            <!-- 2. Middle: Quick Fractions + Stepper Input + Unit Selector -->
            <div class="flex items-center gap-2 flex-wrap shrink-0">
              
              <!-- Quick Fraction Shortcuts (1/4, 1/3, 1/2, 1, 2) for rapid dosage -->
              <div 
                v-if="['pieza', 'taza', 'scoop', 'lata', 'porción', 'rebanada'].includes(ing.unidad)" 
                class="flex items-center gap-1 bg-white dark:bg-black/30 p-0.5 rounded-xl border border-slate-200 dark:border-white/10"
              >
                <button
                  type="button"
                  @click="quickSetQuantity(ing, 0.25)"
                  :class="ing.cantidad === 0.25 ? 'bg-emerald-500 text-white font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold'"
                  class="px-1.5 py-0.5 rounded-lg text-[10px] cursor-pointer transition-colors"
                  title="1/4"
                >
                  ¼
                </button>
                <button
                  type="button"
                  @click="quickSetQuantity(ing, 0.33)"
                  :class="ing.cantidad === 0.33 ? 'bg-emerald-500 text-white font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold'"
                  class="px-1.5 py-0.5 rounded-lg text-[10px] cursor-pointer transition-colors"
                  title="1/3"
                >
                  ⅓
                </button>
                <button
                  type="button"
                  @click="quickSetQuantity(ing, 0.5)"
                  :class="ing.cantidad === 0.5 ? 'bg-emerald-500 text-white font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold'"
                  class="px-1.5 py-0.5 rounded-lg text-[10px] cursor-pointer transition-colors"
                  title="1/2"
                >
                  ½
                </button>
                <button
                  type="button"
                  @click="quickSetQuantity(ing, 1)"
                  :class="ing.cantidad === 1 ? 'bg-emerald-500 text-white font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold'"
                  class="px-1.5 py-0.5 rounded-lg text-[10px] cursor-pointer transition-colors"
                  title="1"
                >
                  1
                </button>
                <button
                  type="button"
                  @click="quickSetQuantity(ing, 2)"
                  :class="ing.cantidad === 2 ? 'bg-emerald-500 text-white font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold'"
                  class="px-1.5 py-0.5 rounded-lg text-[10px] cursor-pointer transition-colors"
                  title="2"
                >
                  2
                </button>
              </div>

              <!-- Stepper Controls & Quantity Number Input -->
              <div class="flex items-center bg-white dark:bg-[#201f22] border-2 border-emerald-500 rounded-xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  @click="stepQuantity(ing, -1)"
                  class="px-2 py-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors font-black text-sm cursor-pointer select-none"
                  title="Reducir cantidad"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.1"
                  min="0.05"
                  max="2000"
                  v-model.number="ing.cantidad"
                  @input="handleQuantityChange(ing)"
                  class="w-16 py-1 bg-transparent text-center font-black text-xs text-slate-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  @click="stepQuantity(ing, 1)"
                  class="px-2 py-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors font-black text-sm cursor-pointer select-none"
                  title="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <!-- Interactive Unit Selector Dropdown -->
              <select
                :value="ing.unidad"
                @change="onUnitSelectChange(ing, $event)"
                class="px-2.5 py-1.5 bg-white dark:bg-[#201f22] border border-slate-200 dark:border-white/15 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                title="Cambiar unidad de medida"
              >
                <option value="g" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">g (Gramos)</option>
                <option value="pieza" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">pieza (Pieza / pza)</option>
                <option value="taza" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">taza (Taza)</option>
                <option value="cda" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">cda (Cucharada)</option>
                <option value="cdta" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">cdta (Cucharadita)</option>
                <option value="rebanada" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">rebanada (Rebanada)</option>
                <option value="scoop" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">scoop (Medida / scoop)</option>
                <option value="lata" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">lata (Lata drenada)</option>
                <option value="ml" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">ml (Mililitros)</option>
                <option value="porción" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">porción (Porción)</option>
              </select>

              <!-- Remove Ingredient Button -->
              <button
                type="button"
                @click="removeIngredient(idx)"
                class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                title="Quitar este ingrediente"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div v-if="editableIngredients.length === 0" class="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl space-y-1">
            <p class="font-bold">No hay ingredientes asignados a este platillo.</p>
            <p class="text-[10px]">Utiliza el buscador inferior para añadir los alimentos correspondientes.</p>
          </div>
        </div>
      </div>

      <!-- Add / Substitute Ingredient Search Bar with Category Filters -->
      <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <label class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            + Agregar / Sustituir con Otro Alimento
          </label>
          
          <!-- Source Filter Tabs -->
          <div class="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl text-[10px] font-bold">
            <button
              type="button"
              @click="activeSearchTab = 'all'"
              :class="activeSearchTab === 'all' ? 'bg-white dark:bg-[#201f22] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
              class="px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
            >
              Todos
            </button>
            <button
              type="button"
              @click="activeSearchTab = 'smae'"
              :class="activeSearchTab === 'smae' ? 'bg-white dark:bg-[#201f22] text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
              class="px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
            >
              🇲🇽 Catálogo SMAE
            </button>
            <button
              type="button"
              @click="activeSearchTab = 'local'"
              :class="activeSearchTab === 'local' ? 'bg-white dark:bg-[#201f22] text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
              class="px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
            >
              ⭐ Mis Alimentos
            </button>
            <button
              type="button"
              @click="activeSearchTab = 'fatsecret'"
              :class="activeSearchTab === 'fatsecret' ? 'bg-white dark:bg-[#201f22] text-purple-600 dark:text-purple-400 shadow-2xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
              class="px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
            >
              🌐 FatSecret
            </button>
          </div>
        </div>

        <div class="relative">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            @input="handleSearchInput"
            type="text"
            placeholder="Buscar alimento mexicano o ingrediente (ej. aguacate, pechuga, tortilla, arroz, claras)..."
            class="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
          <button 
            v-if="searchQuery" 
            type="button" 
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md"
          >
            <X class="w-3.5 h-3.5" />
          </button>
          <Loader2 v-if="isSearching" class="w-4 h-4 animate-spin text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Search Loading State -->
        <div 
          v-if="isSearching" 
          class="p-4 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#201f22] shadow-sm"
        >
          <Loader2 class="w-4 h-4 animate-spin text-emerald-500" />
          <span>Consultando catálogo SMAE y FatSecret API...</span>
        </div>

        <!-- Search Results Dropdown -->
        <div 
          v-else-if="filteredSearchResults.length > 0"
          class="max-h-52 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#201f22] shadow-xl p-1.5 space-y-1 scrollbar-thin"
        >
          <div
            v-for="item in filteredSearchResults"
            :key="item.id"
            @click="selectAndAddIngredient(item)"
            class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{{ item.nombre }}</span>
                <span 
                  v-if="item.brand" 
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                >
                  🏷️ {{ item.brand }}
                </span>
                <span 
                  class="text-[8px] font-black uppercase px-1.5 py-0.5 rounded"
                  :class="item.fuente === 'fatsecret' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' : (item.fuente === 'local' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20')"
                >
                  {{ item.fuente === 'fatsecret' ? (item.brand ? 'Marca MX' : 'FatSecret MX') : (item.fuente === 'local' ? 'Mi Alimento' : 'SMAE México') }}
                </span>
              </div>
              <p class="text-[10px] text-slate-400 pt-0.5">Porción estándar: <strong class="text-slate-600 dark:text-slate-300">{{ item.porcion }}</strong></p>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right text-[10px]">
                <span class="font-black text-slate-800 dark:text-slate-200 block">{{ item.macros.calories }} kcal</span>
                <span class="text-slate-400">{{ item.macros.protein }}g P • {{ item.macros.carbs }}g C • {{ item.macros.fat }}g G</span>
              </div>
              <span class="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-500 transition-colors shadow-xs">
                + Añadir
              </span>
            </div>
          </div>

          <!-- Bottom bar to add as custom if needed -->
          <div class="p-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span>¿Buscas un alimento específico?</span>
            <button
              type="button"
              @click="addCustomSearchedIngredient"
              class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              + Agregar "{{ searchQuery }}" manualmente
            </button>
          </div>
        </div>

        <!-- No Results Fallback with Manual Add Button -->
        <div 
          v-else-if="searchQuery.trim() && !isSearching && filteredSearchResults.length === 0" 
          class="p-4 text-center text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#201f22] space-y-2.5 shadow-sm"
        >
          <p class="text-slate-500 dark:text-slate-400">
            No se encontraron alimentos para "<span class="font-bold text-slate-700 dark:text-slate-200">{{ searchQuery }}</span>" en los catálogos.
          </p>

          <div v-if="fatSecretError" class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] text-left max-w-lg mx-auto">
            <span class="font-bold">⚠️ Aviso FatSecret:</span> {{ fatSecretError }}
            <p class="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
              Si estás en local, verifica que tu IP esté permitida en la consola de FatSecret o usa el agregado manual.
            </p>
          </div>

          <div>
            <button
              type="button"
              @click="addCustomSearchedIngredient"
              class="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <Check class="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Agregar "{{ searchQuery }}" como nuevo ingrediente</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Save Options (Save as new in library) -->
      <div class="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer">
          <input
            type="checkbox"
            v-model="saveAsNewInLibrary"
            class="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
          />
          <div class="text-xs">
            <span class="font-bold text-slate-900 dark:text-white">⭐ Guardar además como nueva comida en mi Biblioteca</span>
            <p class="text-[10px] text-slate-400">Podrás reutilizar este platillo personalizado con estas porciones en cualquier plan futuro.</p>
          </div>
        </label>

        <div v-if="saveAsNewInLibrary" class="pt-1">
          <input
            v-model="customDishName"
            type="text"
            placeholder="Nombre para la nueva comida en biblioteca (ej. Tacos de pollo con aguacate 30g)"
            class="w-full px-3.5 py-2 bg-white dark:bg-[#201f22] border-2 border-emerald-500/40 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <!-- Footer Action Buttons -->
      <div class="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 cursor-pointer transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="handleSave"
          class="px-5 py-2 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Check class="w-4 h-4 stroke-[3]" />
          <span>Aplicar Cambios</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, SlidersHorizontal, Trash2, Search, Loader2, Check } from 'lucide-vue-next';
import type { DishItem, DishIngredient } from '../../../types/dietMenu';
import { IngredientSearchService, type IngredientSearchResult } from '../../../services/nutrition/IngredientSearchService';

const props = defineProps<{
  dish: DishItem;
  mealCategory: string;
  dayName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: { updatedDish: DishItem; saveAsNewInLibrary: boolean; customDishName?: string }): void;
}>();

// Editable dish name
const dishName = ref(props.dish.nombre);

// Clone and sanitize ingredients to structured editable models
// baseMacros are now per-gram for all ingredients
const editableIngredients = ref<DishIngredient[]>(
  IngredientSearchService.ensureDishIngredients(props.dish)
);

const originalMacros = { ...props.dish.macros };

const saveAsNewInLibrary = ref(false);
const customDishName = ref(`${props.dish.nombre} (Personalizado)`);

// Keep customDishName aligned with dishName unless manually modified
watch(dishName, (newName) => {
  if (!saveAsNewInLibrary.value || customDishName.value.endsWith('(Personalizado)')) {
    customDishName.value = `${newName.trim() || props.dish.nombre} (Personalizado)`;
  }
});

const searchQuery = ref('');
const searchResults = ref<IngredientSearchResult[]>([]);
const isSearching = ref(false);
const fatSecretError = ref<string | null>(null);
const activeSearchTab = ref<'all' | 'smae' | 'local' | 'fatsecret'>('all');
let searchDebounce: any = null;

// Filter search results by selected tab
const filteredSearchResults = computed(() => {
  if (activeSearchTab.value === 'all') return searchResults.value;
  return searchResults.value.filter(item => item.fuente === activeSearchTab.value);
});

// Real-time macro recalculation based on current ingredients and quantities
const recalculatedMacros = computed(() => {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  editableIngredients.value.forEach(ing => {
    calories += ing.macros?.calories || 0;
    protein += ing.macros?.protein || 0;
    carbs += ing.macros?.carbs || 0;
    fat += ing.macros?.fat || 0;
  });

  return {
    calories: Math.round(calories),
    protein: +(protein.toFixed(1)),
    carbs: +(carbs.toFixed(1)),
    fat: +(fat.toFixed(1))
  };
});

const totalKcalDiff = computed(() => {
  return recalculatedMacros.value.calories - originalMacros.calories;
});

/**
 * Recalculates macros when quantity changes.
 * baseMacros = macros per 1 gram (invariant anchor).
 * Formula: totalGrams = cantidad × gramsPerUnit → macros = baseMacros × totalGrams
 */
function handleQuantityChange(ing: DishIngredient) {
  // Ensure baseMacros exist as per-gram values
  if (!ing.baseMacros) {
    // Calculate total grams for the current quantity + unit
    const currentTotalGrams = IngredientSearchService.calculateIngredientGrams(ing.cantidad || 1, ing.unidad, ing.nombre);
    const safeGrams = Math.max(1, currentTotalGrams);
    ing.baseMacros = {
      calories: ing.macros.calories / safeGrams,
      protein: ing.macros.protein / safeGrams,
      carbs: ing.macros.carbs / safeGrams,
      fat: ing.macros.fat / safeGrams
    };
  }

  const qty = Math.max(0.05, ing.cantidad || 1);
  // Calculate total grams for the new quantity
  const totalGrams = IngredientSearchService.calculateIngredientGrams(qty, ing.unidad, ing.nombre);
  ing.gramosEquivalentes = totalGrams;

  // Apply per-gram macros × total grams
  ing.macros.calories = Math.round(ing.baseMacros.calories * totalGrams);
  ing.macros.protein = +(ing.baseMacros.protein * totalGrams).toFixed(1);
  ing.macros.carbs = +(ing.baseMacros.carbs * totalGrams).toFixed(1);
  ing.macros.fat = +(ing.baseMacros.fat * totalGrams).toFixed(1);
}

function stepQuantity(ing: DishIngredient, direction: number) {
  const normUnit = IngredientSearchService.normalizeUnitKey(ing.unidad);
  let step = 0.25;

  if (normUnit === 'g' || normUnit === 'ml') {
    step = 10;
  } else if (normUnit === 'cdta' || normUnit === 'cda') {
    step = 0.5;
  }

  let newQty = (ing.cantidad || 1) + direction * step;
  if (normUnit === 'g' || normUnit === 'ml') {
    newQty = Math.max(5, Math.round(newQty));
  } else {
    newQty = Math.max(0.05, +(newQty.toFixed(2)));
  }

  ing.cantidad = newQty;
  handleQuantityChange(ing);
}

function quickSetQuantity(ing: DishIngredient, value: number) {
  ing.cantidad = value;
  handleQuantityChange(ing);
}

/**
 * When the user changes the unit (e.g. 'porción' → 'g'), convert the quantity
 * to preserve total grams. baseMacros (per-gram) stays unchanged — no recalculation needed.
 */
function onUnitSelectChange(ing: DishIngredient, event: Event) {
  const select = event.target as HTMLSelectElement;
  const newUnit = select.value;
  const oldUnit = ing.unidad;

  if (oldUnit === newUnit) return;

  // Convert quantity while conserving total mass
  const converted = IngredientSearchService.convertIngredientUnit(
    ing.cantidad,
    oldUnit,
    newUnit,
    ing.nombre
  );

  ing.cantidad = converted.newCantidad;
  ing.unidad = newUnit;
  ing.gramosEquivalentes = converted.totalGrams;

  // baseMacros is per-gram — it does NOT change when switching units.
  // Just recalculate display macros using the converted total grams.
  if (ing.baseMacros) {
    ing.macros.calories = Math.round(ing.baseMacros.calories * converted.totalGrams);
    ing.macros.protein = +(ing.baseMacros.protein * converted.totalGrams).toFixed(1);
    ing.macros.carbs = +(ing.baseMacros.carbs * converted.totalGrams).toFixed(1);
    ing.macros.fat = +(ing.baseMacros.fat * converted.totalGrams).toFixed(1);
  }
}

function removeIngredient(index: number) {
  editableIngredients.value.splice(index, 1);
}

function clearSearch() {
  searchQuery.value = '';
  searchResults.value = [];
  isSearching.value = false;
}

function handleSearchInput() {
  if (searchDebounce) clearTimeout(searchDebounce);
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    isSearching.value = false;
    fatSecretError.value = null;
    return;
  }

  isSearching.value = true;
  fatSecretError.value = null;
  searchDebounce = setTimeout(async () => {
    try {
      searchResults.value = await IngredientSearchService.searchIngredients(searchQuery.value);
      fatSecretError.value = IngredientSearchService.lastFatSecretError;
    } catch (err: any) {
      console.error('Error buscando ingredientes:', err);
      fatSecretError.value = err?.message || 'Error consultando catálogo';
    } finally {
      isSearching.value = false;
    }
  }, 350);
}

function addCustomSearchedIngredient() {
  const name = searchQuery.value.trim();
  if (!name) return;

  const staple = IngredientSearchService.findStapleMatch(name);
  const baseUnit = staple ? staple.unidadBase : 'porción';
  const baseGrams = staple ? staple.gramosReferencia : 50;
  const defaultMacros = staple ? { ...staple.macros } : { calories: 50, protein: 2, carbs: 8, fat: 1 };

  const initialQty = (baseUnit === 'g' || baseUnit === 'ml') ? Math.max(1, Math.round(baseGrams)) : 1;
  const initialGrams = (baseUnit === 'g' || baseUnit === 'ml') ? initialQty : baseGrams;

  // baseMacros = per-gram values
  const safeGrams = Math.max(1, initialGrams);
  const newIng: DishIngredient = {
    id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    nombre: name,
    cantidad: initialQty,
    unidad: baseUnit,
    gramosEquivalentes: initialGrams,
    macros: { ...defaultMacros },
    baseMacros: {
      calories: defaultMacros.calories / safeGrams,
      protein: defaultMacros.protein / safeGrams,
      carbs: defaultMacros.carbs / safeGrams,
      fat: defaultMacros.fat / safeGrams
    }
  };

  editableIngredients.value.push(newIng);
  clearSearch();
}

async function selectAndAddIngredient(item: IngredientSearchResult) {
  // Auto-cache to Firestore if coming from FatSecret
  if (item.fuente === 'fatsecret') {
    await IngredientSearchService.autoCacheFatSecretFood(item);
  }

  const staple = IngredientSearchService.findStapleMatch(item.nombre);
  const baseUnit = item.unidadBase || (staple ? staple.unidadBase : IngredientSearchService.normalizeUnitKey(item.porcion));
  const baseGrams = item.gramosReferencia || (staple ? staple.gramosReferencia : IngredientSearchService.calculateIngredientGrams(1, baseUnit, item.nombre));

  const initialQty = (baseUnit === 'g' || baseUnit === 'ml') ? Math.max(1, Math.round(baseGrams)) : 1;
  const initialGrams = (baseUnit === 'g' || baseUnit === 'ml') ? initialQty : baseGrams;

  // baseMacros = per-gram values (item.macros are for 1 baseUnit = baseGrams grams)
  const safeGrams = Math.max(1, initialGrams);
  const newIng: DishIngredient = {
    id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    nombre: item.nombre,
    cantidad: initialQty,
    unidad: baseUnit,
    gramosEquivalentes: initialGrams,
    macros: { ...item.macros },
    baseMacros: {
      calories: item.macros.calories / safeGrams,
      protein: item.macros.protein / safeGrams,
      carbs: item.macros.carbs / safeGrams,
      fat: item.macros.fat / safeGrams
    }
  };

  editableIngredients.value.push(newIng);
  clearSearch();
}

function handleSave() {
  // Generate human-friendly, clean string ingredients for display, PDF and Word export
  const stringIngredients = editableIngredients.value.map(ing => 
    IngredientSearchService.formatIngredientDisplay(ing)
  );

  const finalName = dishName.value.trim() || props.dish.nombre;

  const updatedDish: DishItem = {
    ...props.dish,
    nombre: finalName,
    ingredientes: stringIngredients,
    ingredientesDetalle: JSON.parse(JSON.stringify(editableIngredients.value)),
    macros: {
      calories: recalculatedMacros.value.calories,
      protein: recalculatedMacros.value.protein,
      carbs: recalculatedMacros.value.carbs,
      fat: recalculatedMacros.value.fat
    }
  };

  emit('save', {
    updatedDish,
    saveAsNewInLibrary: saveAsNewInLibrary.value,
    customDishName: customDishName.value.trim() || finalName
  });
}
</script>
