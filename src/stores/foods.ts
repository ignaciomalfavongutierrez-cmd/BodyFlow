import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'

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
  let unsubscribe: (() => void) | null = null

  function fetchMyFoods() {
    const uid = auth.currentUser?.uid
    if (!uid) return Promise.resolve()

    if (unsubscribe) unsubscribe()

    const q = query(collection(db, `users/${uid}/foods`), orderBy('createdAt', 'desc'))
    
    return new Promise<void>((resolve) => {
      let isFirstLoad = true
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        myFoods.value = querySnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as SavedFood))
        
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      }, (error) => {
        console.error(`[FIREBASE ERROR] Path: users/${uid}/foods`, error)
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      })
    })
  }

  async function saveFood(food: Omit<SavedFood, 'id' | 'createdAt'>) {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const newFoodData = {
      ...food,
      createdAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, `users/${uid}/foods`), newFoodData)
    return { id: docRef.id, ...newFoodData } as SavedFood
  }

  async function removeFood(id: string) {
    const uid = auth.currentUser?.uid
    if (!uid) return

    await deleteDoc(doc(db, `users/${uid}/foods`, id))
  }

  function reset() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    myFoods.value = []
  }

  function searchMyFoods(q: string) {
    if (!q.trim()) return myFoods.value
    const search = q.toLowerCase()
    return myFoods.value.filter(f => 
      f.name.toLowerCase().includes(search) || 
      f.description.toLowerCase().includes(search)
    )
  }

  return { myFoods, fetchMyFoods, saveFood, removeFood, searchMyFoods, reset }
})
