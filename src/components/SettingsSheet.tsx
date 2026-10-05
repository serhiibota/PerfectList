import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, CloudCheck, LoaderCircle, Monitor, Moon, Sun, WifiOff } from 'lucide-react';
import type { ThemeMode } from '@/hooks/useTheme';
import type { AppIcon } from '@/hooks/useAppIcon';
import { BottomSheet } from './BottomSheet';

interface Props {
  open: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  icon: AppIcon;
  onIconChange: (icon: AppIcon) => void;
  offlineReady: boolean;
  online: boolean;
}

const THEMES: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'system', label: 'Авто', Icon: Monitor },
  { mode: 'light', label: 'Светлая', Icon: Sun },
  { mode: 'dark', label: 'Тёмная', Icon: Moon },
];

const ICONS: { id: AppIcon; label: string; src: string }[] = [
  { id: 'dark', label: 'Графит', src: '/apple-touch-icon.png' },
  { id: 'light', label: 'Лён', src: '/apple-touch-icon-light.png' },
];

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="px-3 pt-2 pb-4">
    <h3 className="mb-2.5 text-[12px] font-medium tracking-wide text-muted uppercase">{title}</h3>
    {children}
  </section>
);

export function SettingsSheet(props: Props) {
  const { open, onClose, themeMode, onThemeChange, icon, onIconChange, offlineReady, online } = props;
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

      <Section title="Иконка приложения">
        <div className="grid grid-cols-2 gap-3">
          {ICONS.map(({ id, label, src }) => {
            const active = icon === id;
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => onIconChange(id)}
                aria-pressed={active}
                whileTap={{ scale: 0.97 }}
                className={`flex flex-col items-center gap-2.5 rounded-2xl border p-4 transition-colors ${
                  active ? 'border-accent/40 bg-accent-soft' : 'border-line bg-surface-2/50 hover:bg-surface-2'
                }`}
              >
                <span className="relative">
                  <img src={src} alt="" className="size-16 rounded-[18px] shadow-card" draggable={false} />
                  {active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1.5 -bottom-1.5 grid size-6 place-items-center rounded-full border-2 border-surface bg-accent text-white"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </motion.span>
                  )}
                </span>
                <span className={`text-[13.5px] font-medium ${active ? 'text-ink' : 'text-ink-2'}`}>{label}</span>
              </motion.button>
            );
          })}
        </div>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
          Иконка применяется при добавлении на экран «Домой». Если приложение уже установлено — удалите его и
          добавьте снова.
        </p>
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
