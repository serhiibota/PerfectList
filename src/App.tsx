import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig } from 'framer-motion';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useTheme } from '@/hooks/useTheme';
import { sumItems } from '@/lib/format';
import { receiptFileName, renderReceipt, shareFile, type ShareOutcome } from '@/lib/share';
import { AddStore } from '@/components/AddStore';
import { BudgetBar } from '@/components/BudgetBar';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { ListsSheet } from '@/components/ListsSheet';
import { ReceiptView } from '@/components/ReceiptView';
import { StoreCard } from '@/components/StoreCard';
import { Toast, type ToastState } from '@/components/Toast';

const OUTCOME_MESSAGE: Record<Exclude<ShareOutcome, 'needs-gesture'>, string | null> = {
  shared: 'Чек отправлен',
  downloaded: 'Изображение сохранено',
  cancelled: null,
};

export default function App() {
  const api = useShoppingList();
  const { activeList: list } = api;
  const theme = useTheme();
  const [listsOpen, setListsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, action?: ToastState['action']) => {
    setToast({ id: Date.now(), message, action });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), toast.action ? 8000 : 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const totals = useMemo(
    () => ({
      total: sumItems(list.items),
      remaining: sumItems(list.items.filter((i) => !i.isCompleted)),
      bought: list.items.filter((i) => i.isCompleted).length,
    }),
    [list.items],
  );

  const share = async (file: File) => {
    const outcome = await shareFile(file, list.title);
    if (outcome === 'needs-gesture') {
      // The browser dropped the tap while rendering — ask for one more tap.
      showToast('Чек готов', {
        label: 'Отправить',
        onClick: () => {
          setToast(null);
          void share(file);
        },
      });
      return;
    }
    const msg = OUTCOME_MESSAGE[outcome];
    if (msg) showToast(msg);
  };

  const handleShare = async () => {
    if (!receiptRef.current || exporting) return;
    setExporting(true);
    let file: File;
    try {
      file = await renderReceipt(receiptRef.current, receiptFileName());
    } catch (err) {
      console.error(err);
      showToast('Не удалось создать изображение');
      return;
    } finally {
      // The spinner covers rendering only: on iOS the navigator.share() promise
      // sometimes never settles after sending to another app (e.g. Telegram).
      setExporting(false);
    }
    await share(file);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto min-h-dvh max-w-xl px-4 pb-44">
        <Header
          title={list.title}
          itemCount={list.items.length}
          storeCount={list.stores.length}
          listCount={api.lists.length}
          themeMode={theme.mode}
          exporting={exporting}
          onRename={api.renameList}
          onOpenLists={() => setListsOpen(true)}
          onCycleTheme={theme.cycle}
          onShare={handleShare}
        />

        <main className="mt-6 flex flex-col gap-4" key={list.id}>
          {list.stores.length === 0 && <EmptyState />}
          <LayoutGroup>
            <AnimatePresence initial={false}>
              {list.stores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  items={list.items.filter((i) => i.storeId === store.id)}
                  onRename={(name) => api.renameStore(store.id, name)}
                  onRemove={() => api.removeStore(store.id)}
                  onAddItem={(input) => api.addItem(store.id, input)}
                  onToggleItem={api.toggleItem}
                  onUpdateItem={api.updateItem}
                  onRemoveItem={api.removeItem}
                  onClearCompleted={() => api.clearCompleted(store.id)}
                />
              ))}
            </AnimatePresence>
            <AddStore existing={list.stores.map((s) => s.name)} onAdd={api.addStore} />
          </LayoutGroup>
        </main>
      </div>

      <BudgetBar
        total={totals.total}
        remaining={totals.remaining}
        boughtCount={totals.bought}
        totalCount={list.items.length}
      />

      <ListsSheet
        open={listsOpen}
        lists={api.lists}
        activeId={list.id}
        onClose={() => setListsOpen(false)}
        onSelect={api.selectList}
        onCreate={() => api.createList()}
        onDelete={api.deleteList}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Off-screen, control-free rendition used for the PNG export */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-[-10000px]">
        <ReceiptView ref={receiptRef} list={list} />
      </div>
    </MotionConfig>
  );
}
