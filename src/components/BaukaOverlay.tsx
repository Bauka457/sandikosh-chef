import { motion, AnimatePresence } from 'motion/react';
import { type BaukaPhase } from './CustomerCard';

interface Props {
  phase: BaukaPhase;
  dialog: string | null;
  onChapalk: () => void;
}

// Полноэкранные реакции Бауки: недовольство с кнопкой чапалака,
// видимый удар (рука + ШЛЁП!) и восторг.
export function BaukaOverlay({ phase, dialog, onChapalk }: Props) {
  const active = phase !== 'idle';
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={phase}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] p-6"
        >
          {/* ── НЕДОВОЛЕН: требует чапалак ── */}
          {phase === 'dislike' && (
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="bg-white rounded-3xl p-5 w-full max-w-xs shadow-2xl text-center border-4 border-slate-300">
              <motion.div
                animate={{ rotate: [-4, 4, -4], x: [0, -3, 3, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-7xl mb-1"
              >🐻</motion.div>
              <div className="text-4xl -mt-10 mb-2">😤</div>
              {dialog && (
                <div className="bg-slate-700 text-white text-sm font-black px-3 py-2 rounded-2xl mb-4 leading-snug">
                  {dialog}
                </div>
              )}
              <motion.button
                animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
                style={{ touchAction: 'manipulation' }}
                onClick={onChapalk}
                className="w-full bg-rose-600 text-white font-black text-lg px-4 py-3 rounded-2xl shadow-lg border-b-4 border-rose-800 active:scale-95 active:border-b-0"
              >
                👋 ДАТЬ ЧАПАЛАК!
              </motion.button>
              <p className="text-[10px] font-bold text-slate-400 mt-2">Он притворяется — шлёпни его!</p>
            </motion.div>
          )}

          {/* ── ШЛЁП! Видимый удар ── */}
          {phase === 'slapped' && (
            <div className="relative flex flex-col items-center">
              {/* Баука трясётся от удара */}
              <motion.div
                animate={{ x: [0, -28, 22, -16, 10, -5, 0], rotate: [0, -18, 12, -8, 4, 0] }}
                transition={{ duration: 0.65 }}
                className="text-[7rem] leading-none drop-shadow-2xl"
              >🐻</motion.div>
              {/* Рука прилетает справа */}
              <motion.div
                initial={{ x: 180, y: -40, rotate: 40, opacity: 0 }}
                animate={{ x: 10, y: -10, rotate: -25, opacity: 1 }}
                transition={{ duration: 0.18, ease: 'easeIn' }}
                className="absolute top-6 right-1/2 translate-x-24 text-6xl"
              >👋</motion.div>
              {/* Вспышка удара */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.6, 1.2], opacity: [0, 1, 0.9] }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="absolute top-2 text-6xl"
              >💥</motion.div>
              {/* Звёздочки разлетаются */}
              {['⭐', '✨', '💫', '⭐'].map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0], x: (i - 1.5) * 60, y: -50 - (i % 2) * 30, scale: 1.2, rotate: (i - 1.5) * 90 }}
                  transition={{ delay: 0.18, duration: 0.6 }}
                  className="absolute top-8 text-3xl"
                >{s}</motion.div>
              ))}
              <motion.div
                initial={{ scale: 0, rotate: -8 }}
                animate={{ scale: [0, 1.4, 1], rotate: [0, 4, -2] }}
                transition={{ delay: 0.16, duration: 0.35 }}
                className="mt-2 bg-rose-600 text-white font-black text-3xl px-6 py-2 rounded-3xl border-4 border-rose-300 shadow-2xl"
              >
                ШЛЁП!!! 👋
              </motion.div>
              {dialog && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="mt-3 bg-white text-slate-800 text-sm font-black px-4 py-2 rounded-2xl shadow-xl">
                  {dialog}
                </motion.div>
              )}
            </div>
          )}

          {/* ── ВОСТОРГ ── */}
          {phase === 'loving' && (
            <motion.div initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.55 }}
              className="relative flex flex-col items-center">
              {/* Летящие сердечки */}
              {['💖', '✨', '💕', '⭐', '💖'].map((e, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: [0, 1, 0], y: -90 - (i % 3) * 25, x: (i - 2) * 45 }}
                  transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.2 }}
                  className="absolute top-8 text-3xl pointer-events-none"
                >{e}</motion.div>
              ))}
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-[7rem] leading-none drop-shadow-2xl"
              >🐻</motion.div>
              <motion.div
                animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-5xl -mt-6 mb-2"
              >😍</motion.div>
              {dialog && (
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                  className="bg-rose-500 text-white text-base font-black px-5 py-2.5 rounded-3xl border-4 border-rose-300 shadow-2xl text-center max-w-xs leading-snug"
                >
                  {dialog}
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
