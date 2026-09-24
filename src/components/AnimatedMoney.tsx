import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { formatMoney } from '@/lib/format';

interface Props {
  value: number;
  className?: string;
}

/** A price that smoothly counts to its new value. */
export function AnimatedMoney({ value, className }: Props) {
  const spring = useSpring(value, { stiffness: 170, damping: 26, mass: 0.6 });
  const text = useTransform(spring, (v) => formatMoney(v));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={`tabular ${className ?? ''}`}>{text}</motion.span>;
}
