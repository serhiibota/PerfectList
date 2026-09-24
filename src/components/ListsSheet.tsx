import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, Trash2, X } from 'lucide-react';
import type { ShoppingList } from '@/types/shopping';
import { formatDate, formatMoney, pluralItems, sumItems } from '@/lib/format';

interface Props {
  open: boolean;
  lists: ShoppingList[];
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function ListsSheet({ open, lists, activeId, onClose, onSelect, onCreate, onDelete }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Мои списки"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl px-3 pb-safe"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => (info.offset.y > 100 || info.velocity.y > 600) && onClose()}
          >
            <div className="rounded-[28px] border border-line bg-surface p-2 shadow-float">
              <div className="mx-auto mt-1 mb-2 h-1 w-9 rounded-full bg-faint/60" />
              <div className="flex items-center justify-between px-3 pb-2">
                <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">Мои списки</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Закрыть"
                  className="grid size-8 place-items-center rounded-full bg-surface-2 text-muted transition hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>

              <ul className="max-h-[55dvh] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {lists.map((list) => {
                    const active = list.id === activeId;
                    return (
                      <motion.li
                        key={list.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                            active ? 'bg-accent-soft' : 'hover:bg-surface-2'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelect(list.id);
                              onClose();
                            }}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <span
                              className={`grid size-6 shrink-0 place-items-center rounded-full ${
                                active ? 'bg-accent text-white' : 'border-[1.5px] border-faint'
                              }`}
                            >
                              {active && <Check className="size-3.5" strokeWidth={3} />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[15.5px] font-semibold">{list.title}</span>
                              <span className="tabular block text-[12.5px] text-muted">
                                {formatDate(list.updatedAt)} · {list.items.length} {pluralItems(list.items.length)}
                              </span>
                            </span>
                            <span className="tabular shrink-0 text-[14px] font-medium text-ink-2">
                              {formatMoney(sumItems(list.items))}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Удалить список «${list.title}»?`)) onDelete(list.id);
                            }}
                            aria-label={`Удалить список «${list.title}»`}
                            className="grid size-8 shrink-0 place-items-center rounded-full text-faint transition hover:bg-surface hover:text-danger"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              <button
                type="button"
                onClick={() => {
                  onCreate();
                  onClose();
                }}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-semibold text-bg transition active:scale-[0.99]"
              >
                <Plus className="size-4" strokeWidth={2.5} />
                Новый список
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
