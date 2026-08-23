import type { Category  } from '../../types/shoppingDiet';

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Proteínas', slug: 'proteinas', icon: 'pi pi-heart-fill', sort_order: 1 },
  { id: 'cat-2', name: 'Cereales', slug: 'cereales', icon: 'pi pi-sun', sort_order: 2 },
  { id: 'cat-3', name: 'Verduras', slug: 'verduras', icon: 'pi pi-spin pi-shield', sort_order: 3 },
  { id: 'cat-4', name: 'Frutas', slug: 'frutas', icon: 'pi pi-star-fill', sort_order: 4 },
  { id: 'cat-5', name: 'Grasas', slug: 'grasas', icon: 'pi pi-filter-fill', sort_order: 5 },
  { id: 'cat-6', name: 'Leguminosas', slug: 'leguminosas', icon: 'pi pi-database', sort_order: 6 },
  { id: 'cat-7', name: 'Lácteos', slug: 'lacteos', icon: 'pi pi-box', sort_order: 7 },
  { id: 'cat-8', name: 'Otros', slug: 'otros', icon: 'pi pi-shopping-bag', sort_order: 8 },
];
