import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronsUpDown, LoaderCircle, Monitor, Moon, Share, Sun } from 'lucide-react';
import type { ThemeMode } from '@/hooks/useTheme';
import { formatDate, formatWeekday, pluralItems } from '@/lib/format';

interface Props {
  title: string;
  itemCount: number;
  storeCount: number;
  listCount: number;
  themeMode: ThemeMode;
  exporting: boolean;
  onRename: (title: string) => void;
  onOpenLists: () => void;
  onCycleTheme: () => void;
  onShare: () => void;
}

const THEME_ICON = { system: Monitor, light: Sun, dark: Moon } as const;
const THEME_LABEL = { system: 'Системная тема', light: 'Светлая тема', dark: 'Тёмная тема' } as const;

export function Header(props: Props) {
  const { title, itemCount, storeCount, listCount, themeMode, exporting } = props;
  const [draft, setDraft] = useState(title);
  useEffect(() => setDraft(title), [title]);
  const ThemeIcon = THEME_ICON[themeMode];
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
          <button type="button" onClick={props.onCycleTheme} aria-label={THEME_LABEL[themeMode]} title={THEME_LABEL[themeMode]} className={iconButton}>
            <motion.span key={themeMode} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
              <ThemeIcon className="size-[18px]" />
            </motion.span>
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
        <p className="text-[13px] font-medium text-muted">
          <span className="capitalize">{formatWeekday(now)}</span>, {formatDate(now)}
        </p>
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
