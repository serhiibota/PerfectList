import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { UNITS, type UnitType } from '@/types/shopping';
import { formatMoney, formatQuantity, parseDecimal } from '@/lib/format';

export interface ItemDetailsDraft {
  qty: string;
  unit: UnitType;
  price: string;
}

interface Props {
  value: ItemDetailsDraft;
  onChange: (next: ItemDetailsDraft) => void;
}

const stepFor = (unit: UnitType) => (unit === 'кг' || unit === 'л' ? 0.5 : unit === 'г' || unit === 'мл' ? 100 : 1);

/** Quantity stepper, unit selector and price-per-unit input shared by the add and edit forms. */
export function ItemDetailsFields({ value, onChange }: Props) {
  const { qty, unit, price } = value;
  const quantity = parseDecimal(qty) ?? 0;
  const unitPrice = parseDecimal(price);

  const step = (dir: 1 | -1) => {
    const s = stepFor(unit);
    const next = Math.max(s, Math.round((quantity + dir * s) * 1000) / 1000);
    onChange({ ...value, qty: formatQuantity(next) });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
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
          onChange={(e) => onChange({ ...value, qty: e.target.value })}
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
          onChange={(e) => onChange({ ...value, unit: e.target.value as UnitType })}
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
          onChange={(e) => onChange({ ...value, price: e.target.value })}
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
  );
}
