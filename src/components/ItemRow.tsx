import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ShoppingItem } from '@/types/shopping';
import { formatMoney, formatQuantity, itemTotal } from '@/lib/format';
import { Checkbox } from './Checkbox';

interface Props {
  item: ShoppingItem;
  onToggle: () => void;
  onRemove: () => void;
}

export function ItemRow({ item, onToggle, onRemove }: Props) {
  const total = itemTotal(item);
  const done = item.isCompleted;

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="group overflow-hidden"
    >
      <div className="flex items-center gap-3 py-2.5">
        <Checkbox checked={done} onChange={onToggle} label={item.name} />

        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left outline-none">
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

        {item.estimatedPrice !== undefined && (
          <motion.span
            className="tabular shrink-0 text-[14px] font-medium"
            animate={{ color: done ? 'var(--muted)' : 'var(--ink-2)' }}
          >
            {formatMoney(total)}
          </motion.span>
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Удалить «${item.name}»`}
          className="grid size-7 shrink-0 place-items-center rounded-full text-faint transition hover:bg-surface-2 hover:text-danger focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
    </motion.li>
  );
}
