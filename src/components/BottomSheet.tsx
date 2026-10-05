import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Draggable bottom sheet with a backdrop, closed by Escape, backdrop tap or a swipe down. */
export function BottomSheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl px-3 pb-safe"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => (info.offset.y > 100 || info.velocity.y > 600) && onClose()}
          >
            <div className="rounded-[28px] border border-line bg-surface p-2 shadow-float">
              <div className="mx-auto mt-1 mb-2 h-1 w-9 rounded-full bg-faint/60" />
              <div className="flex items-center justify-between px-3 pb-2">
                <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Закрыть"
                  className="grid size-8 place-items-center rounded-full bg-surface-2 text-muted transition hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
