import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore'

export interface SavedFood {
  id: string
  name: string
  description: string
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
  const myFoods = ref<SavedFood[]>([])

  async function fetchMyFoods() {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const q = query(collection(db, `users/${uid}/foods`), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    myFoods.value = querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as SavedFood))
  }

  async function saveFood(food: Omit<SavedFood, 'id' | 'createdAt'>) {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const newFoodData = {
      ...food,
      createdAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, `users/${uid}/foods`), newFoodData)
    const newFood = { id: docRef.id, ...newFoodData } as SavedFood
    myFoods.value.unshift(newFood)
    return newFood
  }

  async function removeFood(id: string) {
    const uid = auth.currentUser?.uid
    if (!uid) return

    await deleteDoc(doc(db, `users/${uid}/foods`, id))
    myFoods.value = myFoods.value.filter(f => f.id !== id)
  }

  function reset() {
    myFoods.value = []
  }

  function searchMyFoods(query: string) {
    if (!query) return myFoods.value
    const lower = query.toLowerCase()
    return myFoods.value.filter(f => f.name.toLowerCase().includes(lower) || f.description.toLowerCase().includes(lower))
  }

  return { myFoods, fetchMyFoods, saveFood, removeFood, searchMyFoods, reset }
})
