import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface Props {
  level: number | null; // показываем при 3 и 5
}

export function ComboToast({ level }: Props) {
  const isSuper = (level ?? 0) >= 5;
  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          key={`combo-${level}`}
          initial={{ scale: 0.3, opacity: 0, y: 20 }}
          animate={{ scale: [0.3, 1.25, 1], opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: -30 }}
          transition={{ duration: 0.45, times: [0, 0.6, 1] }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className={cn(
            "rounded-3xl px-6 py-3 font-black text-2xl shadow-2xl text-center border-4 whitespace-nowrap",
            isSuper
              ? 'bg-purple-600 text-white border-purple-300'
              : 'bg-rose-500 text-white border-rose-300'
          )}>
            {isSuper ? `⚡ СУПЕР КОМБО ×${level}!` : `🔥 КОМБО ×${level}!`}
            <div className="text-xs font-bold opacity-80 mt-0.5">
              {isSuper ? 'Монеты ×3!' : 'Монеты ×2!'}
            </div>
          </div>
          {/* Конфетти для супер-комбо */}
          {isSuper && ['🎉', '✨', '⭐', '💜', '🎊'].map((e, i) => (
            <motion.div key={i}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, x: (i - 2) * 40, y: -50 - (i % 3) * 25, scale: 1.3, rotate: (i - 2) * 60 }}
              transition={{ duration: 1 }}
              className="absolute top-0 left-1/2 text-xl"
            >{e}</motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
