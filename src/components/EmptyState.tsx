import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center px-6 pt-10 pb-6 text-center"
    >
      <div className="grid size-16 place-items-center rounded-[20px] border border-line bg-surface shadow-card">
        <ShoppingBag className="size-7 text-accent" strokeWidth={1.75} />
      </div>
      <h2 className="font-display mt-5 text-[19px] font-semibold tracking-[-0.01em]">Чистый лист</h2>
      <p className="mt-1.5 max-w-[260px] text-[14px] leading-relaxed text-muted">
        Добавьте магазины — и собирайте покупки для каждого на одном полотне.
      </p>
    </motion.div>
  );
}
