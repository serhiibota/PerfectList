import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Store } from 'lucide-react';

interface Props {
  existing: string[];
  onAdd: (name: string) => void;
}

const SUGGESTIONS = ['Сільпо', 'АТБ', 'Novus', 'Аптека', 'Рынок', 'Metro', 'Эпицентр', 'Пекарня'];

export function AddStore({ existing, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const suggestions = SUGGESTIONS.filter(
    (s) => !existing.some((e) => e.toLowerCase() === s.toLowerCase()),
  ).slice(0, 6);

  const add = (value: string) => {
    if (!value.trim()) return;
    onAdd(value);
    setName('');
    setOpen(false);
  };

  return (
    <motion.div layout transition={{ type: 'spring', stiffness: 380, damping: 34 }}>
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            onSubmit={(e) => {
              e.preventDefault();
              add(name);
            }}
            className="rounded-[22px] border border-line bg-surface p-4 shadow-card"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <Store className="size-[18px]" />
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
                placeholder="Название магазина"
                aria-label="Название магазина"
                enterKeyHint="done"
                className="font-display min-w-0 flex-1 bg-transparent text-[17px] font-semibold outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[13px] text-muted transition hover:text-ink"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="h-8 rounded-full bg-accent px-3.5 text-[13px] font-semibold text-white transition disabled:opacity-35"
              >
                Добавить
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 pl-12">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={s}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: 0.03 * i } }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => add(s)}
                    className="h-7 rounded-full border border-line bg-surface-2 px-3 text-[12.5px] font-medium text-ink-2 transition hover:border-accent/30 hover:text-accent"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.form>
        ) : (
          <motion.button
            key="button"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[22px] border-[1.5px] border-dashed border-faint/70 py-4 text-[14.5px] font-medium text-muted transition hover:border-accent/40 hover:bg-accent-soft/40 hover:text-accent"
          >
            <Plus className="size-4" strokeWidth={2.4} />
            Добавить магазин
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
