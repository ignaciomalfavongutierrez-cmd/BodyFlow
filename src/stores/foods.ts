import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SavedFood {
  id: string
  name: string
  description: string // e.g. "100g", "1 serving"
  macros: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }
  createdAt: string
}

export const useFoodsStore = defineStore('foods', () => {
  const myFoods = ref<SavedFood[]>(
    JSON.parse(localStorage.getItem('bf_myFoods') || '[]')
  )

  function saveFood(food: Omit<SavedFood, 'id' | 'createdAt'>) {
    const newFood: SavedFood = {
      ...food,
      id: `myfood_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString()
    }
    myFoods.value.unshift(newFood)
    persist()
    return newFood
  }

  function removeFood(id: string) {
    myFoods.value = myFoods.value.filter(f => f.id !== id)
    persist()
  }

  function searchMyFoods(query: string): SavedFood[] {
    if (!query.trim()) return myFoods.value.slice(0, 10)
    const q = query.toLowerCase()
    return myFoods.value.filter(f => f.name.toLowerCase().includes(q))
  }

  function persist() {
    localStorage.setItem('bf_myFoods', JSON.stringify(myFoods.value))
  }

  return { myFoods, saveFood, removeFood, searchMyFoods }
})
