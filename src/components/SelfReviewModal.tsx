import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe } from '../types';
import { cn } from '../utils';

interface Props {
  recipe: Recipe;
  playerName: string;
  onPlayAgain: () => void;
  onChooseOther: () => void;
}

const RATINGS = [
  { emoji: '😫', label: 'Ужасно', color: 'bg-slate-500', msg: 'Ничего, шеф учится! Ещё раз — и будет лучше 💪' },
  { emoji: '😕', label: 'Так себе', color: 'bg-orange-400', msg: 'Уже теплее! Попробуй приготовить снова 🔥' },
  { emoji: '😐', label: 'Нормально', color: 'bg-amber-400', msg: 'Пойдёт! Но лучший шеф не останавливается ⚡' },
  { emoji: '😊', label: 'Вкусно!', color: 'bg-emerald-500', msg: 'Отличная работа, шеф! Гости довольны 👏' },
  { emoji: '😍', label: 'Шедевр!', color: 'bg-rose-500', msg: 'Мишлен звонил. Ты — гений кухни! ⭐⭐⭐' },
];

export function SelfReviewModal({ recipe, playerName, onPlayAgain, onChooseOther }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const chosen = rating !== null ? RATINGS[rating] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="bg-white w-full rounded-t-3xl shadow-2xl border-t-4 border-amber-400 p-5 pb-8"
      >
        {/* Dish summary */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-5xl drop-shadow">{recipe.icon}</div>
          <div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">✅ Готово!</div>
            <div className="text-lg font-black text-slate-800 leading-tight">{recipe.name}</div>
            <div className="text-[11px] font-bold text-slate-400">{playerName}, как получилось?</div>
          </div>
        </div>

        {/* Rating emojis */}
        <div className="flex justify-between gap-1 mb-4">
          {RATINGS.map((r, i) => (
            <motion.button
              key={i}
              onClick={() => setRating(i)}
              whileTap={{ scale: 0.88 }}
              animate={rating === i ? { scale: [1, 1.25, 1.15] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl border-3 transition-all",
                rating === i
                  ? `${r.color} border-transparent shadow-lg`
                  : 'bg-amber-50 border-amber-100'
              )}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className={cn("text-[8px] font-black leading-none", rating === i ? 'text-white' : 'text-slate-500')}>
                {r.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          {chosen && (
            <motion.div
              key={rating}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("rounded-2xl px-4 py-3 mb-4 text-center", chosen.color)}
            >
              <p className="text-sm font-black text-white leading-snug">{chosen.msg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-orange-500 text-white font-black rounded-2xl text-sm active:scale-95 border-b-4 border-orange-700 shadow"
          >
            🔄 Ещё раз
          </button>
          <button
            onClick={onChooseOther}
            className="flex-1 py-3 bg-white border-2 border-amber-300 text-amber-700 font-black rounded-2xl text-sm active:scale-95"
          >
            📖 Другой рецепт
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
