export type UnitType = 'шт' | 'кг' | 'г' | 'пачка' | 'л' | 'мл' | 'уп';

export const UNITS: readonly UnitType[] = ['шт', 'кг', 'г', 'пачка', 'л', 'мл', 'уп'];

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  /** Approximate price per unit, ₴ */
  estimatedPrice?: number;
  isCompleted: boolean;
  storeId: string;
  createdAt: number;
}

export interface StoreSection {
  id: string;
  name: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  stores: StoreSection[];
  items: ShoppingItem[];
  createdAt: number;
  updatedAt: number;
}

export type NewItemInput = Pick<ShoppingItem, 'name' | 'quantity' | 'unit' | 'estimatedPrice'>;
