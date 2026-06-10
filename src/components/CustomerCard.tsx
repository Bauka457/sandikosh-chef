import { motion, AnimatePresence } from 'motion/react';
import { CHARACTERS, RECIPES } from '../data';
import { Order } from '../types';
import { cn } from '../utils';

interface Props {
  order: Order;
  onServe: (orderId: string) => void;
  canServe: boolean;
  isUrgent?: boolean; // most urgent among all active orders
}

export function CustomerCard({ order, onServe, canServe, isUrgent }: Props) {
  const character = CHARACTERS.find(c => c.id === order.characterId);
  const recipe = RECIPES[order.recipeId];
  if (!character || !recipe) return null;

  const timerPct = (order.timeLeft / order.maxTime) * 100;
  const isPanic = order.maxTime > 30 && order.timeLeft < 15;
  const isWarning = order.maxTime > 30 && order.timeLeft < 30 && !isPanic;

  const timerColor = isPanic ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative flex flex-col items-center justify-end h-48 w-28"
    >
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {order.status === 'waiting' && (
          <motion.div
            key={isPanic ? 'panic' : 'normal'}
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0 }}
            className="absolute -top-10 z-20"
          >
            {isPanic ? (
              /* PANIC: giant pulsing countdown */
              <motion.div
                animate={{ scale: [1, 1.08, 1], backgroundColor: ['#ef4444', '#b91c1c', '#ef4444'] }}
                transition={{ repeat: Infinity, duration: 0.45 }}
                className="relative bg-rose-500 rounded-2xl border-4 border-rose-300 px-3 py-1.5 flex flex-col items-center shadow-xl"
                style={{ minWidth: 72 }}
              >
                <div className="text-rose-100 text-[8px] font-black uppercase tracking-widest leading-none">СПЕШИ!</div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.45 }}
                  className="text-white font-black tabular-nums leading-none"
                  style={{ fontSize: 36 }}
                >
                  {order.timeLeft}
                </motion.div>
                <div className="text-rose-200 text-[8px] font-black leading-none">сек</div>
                {/* tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-rose-500 border-b-2 border-r-2 border-rose-300 rotate-45" />
              </motion.div>
            ) : (
              /* NORMAL: icon + recipe name */
              <div
                className={cn(
                  "relative bg-white border-2 rounded-2xl px-2 py-1.5 shadow-md flex flex-col items-center",
                  isWarning ? 'border-amber-400' : isUrgent ? 'border-orange-400' : 'border-slate-200'
                )}
                style={{ minWidth: 72 }}
              >
                <div className="text-2xl leading-none">{recipe.icon}</div>
                <div className="text-[11px] font-black text-slate-800 text-center leading-tight mt-0.5 max-w-16">
                  {recipe.name}
                </div>
                {isUrgent && !isWarning && (
                  <div className="absolute -top-2 -right-2 text-base">⚡</div>
                )}
                {/* tail */}
                <div className={cn(
                  "absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b-2 border-r-2 rotate-45",
                  isWarning ? 'border-amber-400' : 'border-slate-200'
                )} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction bubble */}
      <AnimatePresence>
        {order.status === 'eating' && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-10 z-30 flex flex-col items-center text-center"
          >
            {order.reaction === 'bauka_wow' ? (
              <div className="text-3xl animate-bounce">💖✨😍</div>
            ) : order.reaction === 'wow' ? (
              <div className="text-3xl">❤️</div>
            ) : order.reaction === 'sad' ? (
              <div className="text-3xl">🤢</div>
            ) : (
              <div className="text-3xl">👍</div>
            )}
            {order.reaction === 'bauka_wow' && (
              <div className="bg-white text-xs px-2 py-0.5 rounded-full font-black shadow-md mt-0.5 text-rose-500 border-2 border-rose-200 whitespace-nowrap">
                ВАУ!!!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character body */}
      <motion.button
        disabled={!canServe || order.status !== 'waiting'}
        onClick={() => onServe(order.id)}
        animate={
          isPanic
            ? { x: [0, -7, 7, -5, 5, -3, 3, 0], y: [0, -5, 2, -3, 0] }
            : order.reaction === 'bauka_wow'
            ? { y: [0, -18, 0], rotate: [0, -8, 8, 0] }
            : {}
        }
        transition={{
          duration: isPanic ? 0.3 : 0.5,
          repeat: isPanic || order.reaction === 'bauka_wow' ? Infinity : 0,
          repeatDelay: isPanic ? 0.05 : 0,
        }}
        className={cn(
          "relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg border-4 transition-transform z-10",
          character.color,
          canServe && order.status === 'waiting' ? 'border-green-400 scale-105 cursor-pointer' : 'border-transparent',
          isPanic && 'ring-4 ring-rose-400 ring-offset-2 ring-offset-amber-100',
        )}
        whileTap={canServe && order.status === 'waiting' ? { scale: 0.9 } : undefined}
      >
        <div className="text-4xl">{character.animal}</div>

        {/* Name tag */}
        <div className={cn(
          "absolute -top-3 px-2 py-0.5 rounded-full text-[9px] font-black shadow-sm whitespace-nowrap",
          order.reaction === 'bauka_wow'
            ? 'bg-amber-400 text-amber-900 border border-amber-200'
            : isPanic
            ? 'bg-rose-500 text-white border border-rose-300'
            : 'bg-white text-slate-800'
        )}>
          {character.name}
        </div>

        {/* Serve indicator */}
        {canServe && order.status === 'waiting' && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow border border-emerald-300"
          >
            Подать!
          </motion.div>
        )}
      </motion.button>

      {/* Timer bar + countdown */}
      {order.status === 'waiting' && order.maxTime > 30 && (
        <div className="w-full mt-2 flex flex-col items-center gap-0.5">
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className={cn('h-full rounded-full transition-colors duration-300', timerColor)}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {!isPanic && (
            <div className={cn(
              "text-[9px] font-black tabular-nums",
              isWarning ? 'text-amber-500' : 'text-slate-400'
            )}>
              ⏱ {order.timeLeft}с
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
