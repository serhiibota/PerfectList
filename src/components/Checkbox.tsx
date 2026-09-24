import { motion } from 'framer-motion';

interface Props {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Checkbox({ checked, onChange, label }: Props) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      whileTap={{ scale: 0.82 }}
      className="relative grid size-[22px] shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <motion.span
        className="absolute inset-0 rounded-full border-[1.5px]"
        initial={false}
        animate={{
          backgroundColor: checked ? 'var(--accent)' : 'rgba(0,0,0,0)',
          borderColor: checked ? 'var(--accent)' : 'var(--faint)',
        }}
        transition={{ duration: 0.2 }}
      />
      <svg viewBox="0 0 24 24" className="relative size-[13px]" fill="none">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: checked ? 0.05 : 0 }}
        />
      </svg>
    </motion.button>
  );
}
