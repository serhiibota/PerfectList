import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsUpDown, CloudOff, LoaderCircle, Settings2, Share } from 'lucide-react';
import { formatDate, formatWeekday, pluralItems } from '@/lib/format';

interface Props {
  title: string;
  itemCount: number;
  storeCount: number;
  listCount: number;
  online: boolean;
  exporting: boolean;
  onRename: (title: string) => void;
  onOpenLists: () => void;
  onOpenSettings: () => void;
  onShare: () => void;
}

export function Header(props: Props) {
  const { title, itemCount, storeCount, listCount, online, exporting } = props;
  const [draft, setDraft] = useState(title);
  useEffect(() => setDraft(title), [title]);
  const now = Date.now();

  const iconButton =
    'grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-card transition hover:text-ink active:scale-95';

  return (
    <header className="pt-safe">
      <div className="flex items-center justify-between gap-2 pt-4">
        <motion.button
          type="button"
          onClick={props.onOpenLists}
          whileTap={{ scale: 0.96 }}
          className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface pr-3 pl-4 text-[13.5px] font-medium text-ink-2 shadow-card transition hover:text-ink"
        >
          Мои списки
          <span className="tabular rounded-full bg-surface-2 px-1.5 text-[11.5px] text-muted">{listCount}</span>
          <ChevronsUpDown className="size-3.5 text-muted" />
        </motion.button>

        <div className="flex items-center gap-2">
          <button type="button" onClick={props.onOpenSettings} aria-label="Настройки" className={iconButton}>
            <Settings2 className="size-[18px]" />
          </button>
          <motion.button
            type="button"
            onClick={props.onShare}
            disabled={exporting}
            whileTap={{ scale: 0.95 }}
            aria-label="Поделиться списком: длинный чек"
            className="flex h-10 items-center gap-2 rounded-full bg-ink pr-4 pl-3.5 text-[13.5px] font-semibold text-bg shadow-float transition disabled:opacity-70"
          >
            {exporting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Share className="size-4" strokeWidth={2.2} />
            )}
            <span>Длинный чек</span>
          </motion.button>
        </div>
      </div>

      <div className="mt-8 px-1">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-muted">
            <span className="capitalize">{formatWeekday(now)}</span>, {formatDate(now)}
          </p>
          <AnimatePresence>
            {!online && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                title="Нет сети — всё сохраняется на устройстве"
                className="flex h-5 items-center gap-1 rounded-full bg-surface-2 px-2 text-[11.5px] font-medium text-ink-2"
              >
                <CloudOff className="size-3" strokeWidth={2.4} />
                Офлайн
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => (draft.trim() ? props.onRename(draft) : setDraft(title))}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          aria-label="Название списка"
          className="font-display mt-1 w-full bg-transparent text-[34px] leading-tight font-bold tracking-[-0.025em] outline-none"
        />
        <p className="tabular mt-1 text-[13.5px] text-muted">
          {itemCount} {pluralItems(itemCount)} · {storeCount}{' '}
          {storeCount === 1 ? 'магазин' : storeCount >= 2 && storeCount <= 4 ? 'магазина' : 'магазинов'}
        </p>
      </div>
    </header>
  );
}
