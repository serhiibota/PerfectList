import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { NewItemInput, ShoppingItem } from '@/types/shopping';
import { formatMoney, formatQuantity, itemTotal, parseDecimal } from '@/lib/format';
import { Checkbox } from './Checkbox';
import { ItemDetailsFields, type ItemDetailsDraft } from './ItemDetailsFields';

interface Props {
  item: ShoppingItem;
  onToggle: () => void;
  onUpdate: (input: NewItemInput) => void;
  onRemove: () => void;
}

const draftFrom = (item: ShoppingItem): ItemDetailsDraft => ({
  qty: formatQuantity(item.quantity),
  unit: item.unit,
  price: item.estimatedPrice !== undefined ? String(item.estimatedPrice).replace('.', ',') : '',
});

export function ItemRow({ item, onToggle, onUpdate, onRemove }: Props) {
  const total = itemTotal(item);
  const done = item.isCompleted;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [details, setDetails] = useState<ItemDetailsDraft>(() => draftFrom(item));
  const rowRef = useRef<HTMLLIElement>(null);

  const startEditing = () => {
    setName(item.name);
    setDetails(draftFrom(item));
    setEditing(true);
  };

  const save = () => {
    onUpdate({
      name: name.trim() || item.name,
      quantity: parseDecimal(details.qty) || item.quantity,
      unit: details.unit,
      estimatedPrice: parseDecimal(details.price),
    });
    setEditing(false);
  };

  // Tapping anywhere outside the row saves the edit (like Things / Apple Notes).
  // Pointer events rather than blur: on iOS, tapping a button doesn't move focus.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (!editing) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rowRef.current?.contains(e.target as Node)) saveRef.current();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [editing]);

  return (
    <motion.li
      ref={rowRef}
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="group overflow-hidden"
      onKeyDown={(e) => {
        if (!editing) return;
        if (e.key === 'Escape') setEditing(false);
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
          e.preventDefault();
          save();
        }
      }}
    >
      <motion.div
        initial={false}
        animate={{ backgroundColor: editing ? 'var(--surface-2)' : 'rgba(0,0,0,0)' }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl px-2"
      >
        <div className="flex items-center gap-3 py-2.5">
          <Checkbox checked={done} onChange={onToggle} label={item.name} />

          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Название товара"
              enterKeyHint="done"
              className="min-w-0 flex-1 bg-transparent text-[15.5px] leading-snug font-medium outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={startEditing}
              aria-label={`Изменить «${item.name}»`}
              className="min-w-0 flex-1 text-left outline-none"
            >
              <span className="relative inline-block max-w-full">
                <motion.span
                  className="block truncate text-[15.5px] leading-snug"
                  animate={{ color: done ? 'var(--muted)' : 'var(--ink)' }}
                  transition={{ duration: 0.25 }}
                >
                  {item.name}
                </motion.span>
                <motion.span
                  aria-hidden
                  className="absolute top-1/2 left-0 h-[1.5px] w-full origin-left rounded-full bg-muted"
                  initial={false}
                  animate={{ scaleX: done ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
                />
              </span>
              <span className="tabular mt-0.5 block text-[12.5px] text-muted">
                {formatQuantity(item.quantity)} {item.unit}
                {item.estimatedPrice !== undefined && (
                  <>
                    <span className="mx-1 text-faint">·</span>
                    {formatMoney(item.estimatedPrice, false)}/{item.unit}
                  </>
                )}
              </span>
            </button>
          )}

          {!editing && item.estimatedPrice !== undefined && (
            <motion.span
              className="tabular shrink-0 text-[14px] font-medium"
              animate={{ color: done ? 'var(--muted)' : 'var(--ink-2)' }}
            >
              {formatMoney(total)}
            </motion.span>
          )}

          {!editing && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Удалить «${item.name}»`}
              className="grid size-7 shrink-0 place-items-center rounded-full text-faint transition hover:bg-surface-2 hover:text-danger focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {editing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="pb-3 pl-[34px] [&_.bg-surface-2]:bg-surface">
                <ItemDetailsFields value={details} onChange={setDetails} />
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onRemove}
                    className="text-[13px] font-medium text-danger transition hover:opacity-75"
                  >
                    Удалить
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="text-[13px] text-muted transition hover:text-ink"
                    >
                      Отмена
                    </button>
                    <motion.button
                      type="button"
                      onClick={save}
                      whileTap={{ scale: 0.94 }}
                      className="h-8 rounded-full bg-accent px-4 text-[13px] font-semibold text-white"
                    >
                      Готово
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.li>
  );
}
