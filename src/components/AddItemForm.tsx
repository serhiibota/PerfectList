import { useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ChevronDown, Minus, Plus } from 'lucide-react';
import { UNITS, type NewItemInput, type UnitType } from '@/types/shopping';
import { formatMoney, formatQuantity, parseDecimal } from '@/lib/format';

interface Props {
  onAdd: (input: NewItemInput) => void;
}

const stepFor = (unit: UnitType) => (unit === 'кг' || unit === 'л' ? 0.5 : unit === 'г' || unit === 'мл' ? 100 : 1);

export function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState<UnitType>('шт');
  const [price, setPrice] = useState('');
  const [focused, setFocused] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const expanded = focused || name.length > 0;
  const quantity = parseDecimal(qty) ?? 0;
  const unitPrice = parseDecimal(price);
  const canSubmit = name.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({ name, quantity: quantity > 0 ? quantity : 1, unit, estimatedPrice: unitPrice });
    setName('');
    setQty('1');
    setUnit('шт');
    setPrice('');
    nameRef.current?.focus();
  };

  const step = (dir: 1 | -1) => {
    const s = stepFor(unit);
    const next = Math.max(s, Math.round((quantity + dir * s) * 1000) / 1000);
    setQty(formatQuantity(next));
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
            <div className="flex flex-wrap items-center gap-2 pb-2 pl-[34px]">
              {/* Quantity stepper */}
              <div className="flex h-9 items-center rounded-xl bg-surface-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Меньше"
                  className="grid h-full w-8 place-items-center text-muted transition hover:text-ink"
                >
                  <Minus className="size-3.5" />
                </button>
                <input
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  inputMode="decimal"
                  aria-label="Количество"
                  className="tabular w-10 bg-transparent text-center text-[14px] font-medium outline-none"
                />
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Больше"
                  className="grid h-full w-8 place-items-center text-muted transition hover:text-ink"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              {/* Unit selector */}
              <label className="relative flex h-9 items-center rounded-xl bg-surface-2">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  aria-label="Единица измерения"
                  className="h-full cursor-pointer appearance-none bg-transparent pr-7 pl-3 text-[14px] font-medium outline-none"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-muted" />
              </label>

              {/* Price per unit */}
              <label className="flex h-9 items-center gap-1 rounded-xl bg-surface-2 px-3">
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="Цена"
                  aria-label="Примерная цена за единицу"
                  className="tabular w-14 bg-transparent text-[14px] font-medium outline-none"
                />
                <span className="text-[13px] whitespace-nowrap text-muted">₴/{unit}</span>
              </label>

              <AnimatePresence>
                {unitPrice !== undefined && quantity > 0 && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="tabular ml-auto text-[13px] text-muted"
                  >
                    = {formatMoney(unitPrice * quantity)}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
