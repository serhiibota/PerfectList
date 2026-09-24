import { motion } from 'framer-motion';
import { AnimatedMoney } from './AnimatedMoney';

interface Props {
  total: number;
  remaining: number;
  boughtCount: number;
  totalCount: number;
}

export function BudgetBar({ total, remaining, boughtCount, totalCount }: Props) {
  const spentShare = total > 0 ? (total - remaining) / total : totalCount ? boughtCount / totalCount : 0;

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.15 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-safe"
    >
      <div className="pointer-events-auto mx-auto max-w-xl rounded-[24px] border border-line bg-surface/90 px-5 py-4 shadow-float backdrop-blur-2xl backdrop-saturate-150">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] font-medium tracking-wide text-muted uppercase">Осталось потратить</p>
            <AnimatedMoney
              value={remaining}
              className="font-display block text-[28px] leading-tight font-semibold tracking-[-0.02em]"
            />
          </div>
          <div className="text-right">
            <p className="text-[12px] font-medium tracking-wide text-muted uppercase">Бюджет</p>
            <AnimatedMoney value={total} className="block text-[17px] leading-tight font-semibold text-ink-2" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: `${Math.min(1, spentShare) * 100}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 24 }}
            />
          </div>
          <span className="tabular shrink-0 text-[12px] text-muted">
            {boughtCount} / {totalCount}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
