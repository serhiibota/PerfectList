import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Trash2 } from 'lucide-react';
import type { NewItemInput, ShoppingItem, StoreSection } from '@/types/shopping';
import { sumItems } from '@/lib/format';
import { AnimatedMoney } from './AnimatedMoney';
import { AddItemForm } from './AddItemForm';
import { ItemRow } from './ItemRow';

interface Props {
  store: StoreSection;
  items: ShoppingItem[];
  onRename: (name: string) => void;
  onRemove: () => void;
  onAddItem: (input: NewItemInput) => void;
  onToggleItem: (id: string) => void;
  onUpdateItem: (id: string, input: NewItemInput) => void;
  onRemoveItem: (id: string) => void;
  onClearCompleted: () => void;
}

/** How long a just-bought item stays in place (struck through) before moving to «Куплено». */
const LINGER_MS = 650;

const hueFor = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 17);

export function StoreCard(props: Props) {
  const { store, items, onRename, onRemove, onAddItem, onToggleItem, onUpdateItem, onRemoveItem, onClearCompleted } =
    props;
  const [lingering, setLingering] = useState<ReadonlySet<string>>(new Set());
  const [showDone, setShowDone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draftName, setDraftName] = useState(store.name);
  const timers = useRef<number[]>([]);

  useEffect(() => setDraftName(store.name), [store.name]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!confirmDelete) return;
    const t = window.setTimeout(() => setConfirmDelete(false), 2500);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const { active, done } = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.createdAt - b.createdAt);
    return {
      active: sorted.filter((i) => !i.isCompleted || lingering.has(i.id)),
      done: sorted.filter((i) => i.isCompleted && !lingering.has(i.id)),
    };
  }, [items, lingering]);

  const subtotal = sumItems(items);
  const boughtCount = items.filter((i) => i.isCompleted).length;
  const progress = items.length ? boughtCount / items.length : 0;
  const hue = hueFor(store.name);

  const toggle = (item: ShoppingItem) => {
    if (!item.isCompleted) {
      setLingering((s) => new Set(s).add(item.id));
      timers.current.push(
        window.setTimeout(() => {
          setLingering((s) => {
            const next = new Set(s);
            next.delete(item.id);
            return next;
          });
        }, LINGER_MS),
      );
    }
    onToggleItem(item.id);
  };

  const commitName = () => {
    if (draftName.trim() && draftName.trim() !== store.name) onRename(draftName);
    else setDraftName(store.name);
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-card"
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl text-[15px] font-semibold"
          style={{
            background: `hsl(${hue} 70% 60% / 0.14)`,
            color: `hsl(${hue} 55% 48%)`,
          }}
        >
          {store.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                setDraftName(store.name);
                requestAnimationFrame(() => (e.target as HTMLInputElement).blur());
              }
            }}
            aria-label="Название магазина"
            className="font-display w-full truncate bg-transparent text-[17px] font-semibold tracking-[-0.01em] outline-none"
          />
          <p className="tabular text-[12.5px] text-muted">
            {items.length === 0 ? 'Пока пусто' : `${boughtCount} из ${items.length} куплено`}
          </p>
        </div>
        <AnimatedMoney value={subtotal} className="text-[15px] font-semibold text-ink" />
        <motion.button
          type="button"
          layout
          onClick={() => (confirmDelete ? onRemove() : setConfirmDelete(true))}
          aria-label={confirmDelete ? 'Подтвердить удаление магазина' : 'Удалить магазин'}
          className={`flex h-8 shrink-0 items-center justify-center gap-1 rounded-full text-[12.5px] font-medium transition-colors ${
            confirmDelete ? 'bg-danger/12 px-3 text-danger' : 'w-8 text-faint hover:bg-surface-2 hover:text-ink-2'
          }`}
        >
          <Trash2 className="size-[15px]" />
          {confirmDelete && <span>Удалить</span>}
        </motion.button>
      </header>

      {/* Progress hairline */}
      <div className="mx-4 h-[3px] overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 26 }}
        />
      </div>

      {/* Items */}
      <div className="px-4 pt-1 pb-2">
        <ul className="-mx-2">
          <AnimatePresence initial={false}>
            {active.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={() => toggle(item)}
                onUpdate={(input) => onUpdateItem(item.id, input)}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
          </AnimatePresence>
        </ul>

        <AddItemForm onAdd={onAddItem} />
      </div>

      {/* Bought */}
      <AnimatePresence initial={false}>
        {done.length > 0 && (
          <motion.div
            key="done"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden border-t border-line bg-surface-2/40"
          >
            <div className="flex items-center px-4">
              <button
                type="button"
                onClick={() => setShowDone((v) => !v)}
                aria-expanded={showDone}
                className="flex flex-1 items-center gap-2 py-3 text-left text-[13px] font-medium text-muted outline-none"
              >
                <motion.span animate={{ rotate: showDone ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="size-4" />
                </motion.span>
                Куплено
                <motion.span
                  key={done.length}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="tabular rounded-full bg-surface-2 px-1.5 py-px text-[11.5px] text-ink-2"
                >
                  {done.length}
                </motion.span>
              </button>
              <AnimatePresence>
                {showDone && (
                  <motion.button
                    type="button"
                    onClick={onClearCompleted}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[12.5px] text-muted transition hover:text-danger"
                  >
                    Очистить
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence initial={false}>
              {showDone && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  className="overflow-hidden px-2 pb-2"
                >
                  <AnimatePresence initial={false}>
                    {done.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onToggle={() => toggle(item)}
                        onUpdate={(input) => onUpdateItem(item.id, input)}
                        onRemove={() => onRemoveItem(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
