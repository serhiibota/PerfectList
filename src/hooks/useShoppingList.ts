import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NewItemInput, ShoppingItem, ShoppingList, StoreSection } from '@/types/shopping';
import { uid } from '@/lib/format';

const STORAGE_KEY = 'minimallist:v1';

interface PersistedState {
  lists: ShoppingList[];
  activeListId: string;
}

const createEmptyList = (title = 'Новый список'): ShoppingList => {
  const now = Date.now();
  return { id: uid(), title, stores: [], items: [], createdAt: now, updatedAt: now };
};

const createDemoList = (): ShoppingList => {
  const now = Date.now();
  const silpo: StoreSection = { id: uid(), name: 'Сільпо' };
  const pharmacy: StoreSection = { id: uid(), name: 'Аптека' };
  const market: StoreSection = { id: uid(), name: 'Рынок' };
  const item = (store: StoreSection, input: NewItemInput, offset: number): ShoppingItem => ({
    id: uid(),
    storeId: store.id,
    isCompleted: false,
    createdAt: now + offset,
    ...input,
  });
  return {
    id: uid(),
    title: 'Покупки на неделю',
    stores: [silpo, pharmacy, market],
    items: [
      item(silpo, { name: 'Молоко 2,5%', quantity: 2, unit: 'л', estimatedPrice: 48 }, 1),
      item(silpo, { name: 'Сыр гауда', quantity: 0.3, unit: 'кг', estimatedPrice: 420 }, 2),
      item(silpo, { name: 'Хлеб на закваске', quantity: 1, unit: 'шт', estimatedPrice: 65 }, 3),
      item(silpo, { name: 'Кофе в зёрнах', quantity: 1, unit: 'пачка', estimatedPrice: 389 }, 4),
      item(pharmacy, { name: 'Витамин D3', quantity: 1, unit: 'уп', estimatedPrice: 310 }, 5),
      item(pharmacy, { name: 'Пластыри', quantity: 1, unit: 'уп', estimatedPrice: 85 }, 6),
      item(market, { name: 'Томаты', quantity: 1.5, unit: 'кг', estimatedPrice: 90 }, 7),
      item(market, { name: 'Зелень', quantity: 3, unit: 'шт', estimatedPrice: 20 }, 8),
      item(market, { name: 'Клубника', quantity: 0.5, unit: 'кг', estimatedPrice: 180 }, 9),
    ],
    createdAt: now,
    updatedAt: now,
  };
};

const loadState = (): PersistedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (Array.isArray(parsed.lists) && parsed.lists.length > 0) {
        const activeExists = parsed.lists.some((l) => l.id === parsed.activeListId);
        return { lists: parsed.lists, activeListId: activeExists ? parsed.activeListId : parsed.lists[0].id };
      }
    }
  } catch {
    // Corrupted or unavailable storage — start fresh.
  }
  const demo = createDemoList();
  return { lists: [demo], activeListId: demo.id };
};

export function useShoppingList() {
  const [state, setState] = useState<PersistedState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota exceeded or private mode — keep working in memory.
    }
  }, [state]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setState(loadState());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const activeList = useMemo(
    () => state.lists.find((l) => l.id === state.activeListId) ?? state.lists[0],
    [state],
  );

  /** Applies an immutable update to the active list and bumps updatedAt. */
  const updateActive = useCallback((updater: (list: ShoppingList) => ShoppingList) => {
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === prev.activeListId ? { ...updater(l), updatedAt: Date.now() } : l,
      ),
    }));
  }, []);

  // ── Lists ──────────────────────────────────────────────
  const createList = useCallback((title?: string) => {
    const list = createEmptyList(title);
    setState((prev) => ({ lists: [list, ...prev.lists], activeListId: list.id }));
  }, []);

  const selectList = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeListId: id }));
  }, []);

  const deleteList = useCallback((id: string) => {
    setState((prev) => {
      const rest = prev.lists.filter((l) => l.id !== id);
      if (rest.length === 0) {
        const fresh = createEmptyList();
        return { lists: [fresh], activeListId: fresh.id };
      }
      return { lists: rest, activeListId: prev.activeListId === id ? rest[0].id : prev.activeListId };
    });
  }, []);

  const renameList = useCallback(
    (title: string) => updateActive((l) => ({ ...l, title: title.trim() || 'Без названия' })),
    [updateActive],
  );

  // ── Stores ─────────────────────────────────────────────
  const addStore = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateActive((l) => ({ ...l, stores: [...l.stores, { id: uid(), name: trimmed }] }));
    },
    [updateActive],
  );

  const renameStore = useCallback(
    (storeId: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateActive((l) => ({
        ...l,
        stores: l.stores.map((s) => (s.id === storeId ? { ...s, name: trimmed } : s)),
      }));
    },
    [updateActive],
  );

  const removeStore = useCallback(
    (storeId: string) =>
      updateActive((l) => ({
        ...l,
        stores: l.stores.filter((s) => s.id !== storeId),
        items: l.items.filter((i) => i.storeId !== storeId),
      })),
    [updateActive],
  );

  // ── Items ──────────────────────────────────────────────
  const addItem = useCallback(
    (storeId: string, input: NewItemInput) => {
      const name = input.name.trim();
      if (!name) return;
      const item: ShoppingItem = {
        id: uid(),
        storeId,
        name,
        quantity: input.quantity > 0 ? input.quantity : 1,
        unit: input.unit,
        estimatedPrice: input.estimatedPrice,
        isCompleted: false,
        createdAt: Date.now(),
      };
      updateActive((l) => ({ ...l, items: [...l.items, item] }));
    },
    [updateActive],
  );

  const toggleItem = useCallback(
    (itemId: string) =>
      updateActive((l) => ({
        ...l,
        items: l.items.map((i) => (i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i)),
      })),
    [updateActive],
  );

  const updateItem = useCallback(
    (itemId: string, input: NewItemInput) => {
      const name = input.name.trim();
      updateActive((l) => ({
        ...l,
        items: l.items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                name: name || i.name,
                quantity: input.quantity > 0 ? input.quantity : i.quantity,
                unit: input.unit,
                estimatedPrice: input.estimatedPrice,
              }
            : i,
        ),
      }));
    },
    [updateActive],
  );

  const removeItem = useCallback(
    (itemId: string) => updateActive((l) => ({ ...l, items: l.items.filter((i) => i.id !== itemId) })),
    [updateActive],
  );

  const clearCompleted = useCallback(
    (storeId: string) =>
      updateActive((l) => ({
        ...l,
        items: l.items.filter((i) => !(i.storeId === storeId && i.isCompleted)),
      })),
    [updateActive],
  );

  return {
    lists: state.lists,
    activeList,
    createList,
    selectList,
    deleteList,
    renameList,
    addStore,
    renameStore,
    removeStore,
    addItem,
    toggleItem,
    updateItem,
    removeItem,
    clearCompleted,
  };
}

export type ShoppingListApi = ReturnType<typeof useShoppingList>;
