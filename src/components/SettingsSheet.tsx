import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CloudCheck, LoaderCircle, Monitor, Moon, Sun, WifiOff } from 'lucide-react';
import type { ThemeMode } from '@/hooks/useTheme';
import { BottomSheet } from './BottomSheet';

interface Props {
  open: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  offlineReady: boolean;
  online: boolean;
}

const THEMES: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'system', label: 'Авто', Icon: Monitor },
  { mode: 'light', label: 'Светлая', Icon: Sun },
  { mode: 'dark', label: 'Тёмная', Icon: Moon },
];

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="px-3 pt-2 pb-4">
    <h3 className="mb-2.5 text-[12px] font-medium tracking-wide text-muted uppercase">{title}</h3>
    {children}
  </section>
);

export function SettingsSheet(props: Props) {
  const { open, onClose, themeMode, onThemeChange, offlineReady, online } = props;
  const swSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  return (
    <BottomSheet open={open} title="Настройки" onClose={onClose}>
      <Section title="Тема">
        <div className="relative grid grid-cols-3 rounded-2xl bg-surface-2 p-1">
          {THEMES.map(({ mode, label, Icon }) => {
            const active = themeMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onThemeChange(mode)}
                aria-pressed={active}
                className={`relative flex h-10 items-center justify-center gap-1.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  active ? 'text-ink' : 'text-muted hover:text-ink-2'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="theme-pill"
                    className="absolute inset-0 rounded-xl bg-surface shadow-card"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon className="relative size-4" />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Без интернета">
        <div className="flex items-start gap-3 rounded-2xl bg-surface-2/60 p-3.5">
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-xl ${
              offlineReady ? 'bg-accent-soft text-accent' : 'bg-surface text-muted'
            }`}
          >
            {!swSupported ? (
              <WifiOff className="size-[18px]" />
            ) : offlineReady ? (
              <CloudCheck className="size-[18px]" />
            ) : (
              <LoaderCircle className="size-[18px] animate-spin" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[14.5px] font-medium">
              {!swSupported
                ? 'Браузер не поддерживает офлайн'
                : offlineReady
                  ? 'Работает без интернета'
                  : 'Сохраняем приложение…'}
            </p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
              {online ? 'Сейчас вы в сети. ' : 'Сейчас нет сети. '}
              Списки хранятся только на этом устройстве и доступны всегда.
            </p>
          </div>
        </div>
      </Section>
    </BottomSheet>
  );
}
