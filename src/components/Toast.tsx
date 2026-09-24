import { AnimatePresence, motion } from 'framer-motion';

export interface ToastState {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-safe">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -40, opacity: 0, scale: 0.96 }}
            animate={{ y: 12, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-4 text-[13.5px] font-medium text-bg shadow-float"
            onClick={toast.action ? undefined : onDismiss}
          >
            <span>{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                onClick={toast.action.onClick}
                className="h-7 rounded-full bg-accent px-3 text-[12.5px] font-semibold text-white"
              >
                {toast.action.label}
              </button>
            ) : (
              <span className="pr-2" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
