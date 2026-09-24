import { useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Plus } from 'lucide-react';
import type { NewItemInput } from '@/types/shopping';
import { parseDecimal } from '@/lib/format';
import { ItemDetailsFields, type ItemDetailsDraft } from './ItemDetailsFields';

interface Props {
  onAdd: (input: NewItemInput) => void;
}

const EMPTY_DETAILS: ItemDetailsDraft = { qty: '1', unit: 'шт', price: '' };

export function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [details, setDetails] = useState<ItemDetailsDraft>(EMPTY_DETAILS);
  const [focused, setFocused] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const expanded = focused || name.length > 0;
  const canSubmit = name.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({
      name,
      quantity: parseDecimal(details.qty) || 1,
      unit: details.unit,
      estimatedPrice: parseDecimal(details.price),
    });
    setName('');
    setDetails(EMPTY_DETAILS);
    nameRef.current?.focus();
  };

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!formRef.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className="mt-1"
    >
      <div className="flex items-center gap-3 py-2">
        <span className="grid size-[22px] shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-faint text-muted">
          <Plus className="size-3" strokeWidth={2.5} />
        </span>
        <input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Добавить товар"
          aria-label="Название товара"
          enterKeyHint="done"
          className="min-w-0 flex-1 bg-transparent text-[15.5px] outline-none"
        />
        <AnimatePresence>
          {canSubmit && (
            <motion.button
              type="submit"
              aria-label="Добавить"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-white shadow-sm"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-2 pl-[34px]">
              <ItemDetailsFields value={details} onChange={setDetails} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
