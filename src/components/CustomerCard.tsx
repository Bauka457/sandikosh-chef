import { motion, AnimatePresence } from 'motion/react';
import { CHARACTERS, RECIPES } from '../data';
import { Order } from '../types';
import { cn } from '../utils';

export type BaukaPhase = 'idle' | 'dislike' | 'slapped' | 'loving';

interface Props {
  order: Order;
  onServe: (orderId: string) => void;
  canServe: boolean;
  isUrgent?: boolean;
  baukaPhase?: BaukaPhase;
  baukaDialog?: string | null;
  onChapalk?: () => void;
}

export function CustomerCard({
  order, onServe, canServe, isUrgent,
  baukaPhase = 'idle', baukaDialog, onChapalk,
}: Props) {
  const character = CHARACTERS.find(c => c.id === order.characterId);
  const recipe = RECIPES[order.recipeId];
  if (!character || !recipe) return null;

  const isBauka = order.characterId === 'bauka';
  const timerPct = (order.timeLeft / order.maxTime) * 100;
  const isPanic = order.maxTime > 30 && order.timeLeft < 15;
  const isWarning = order.maxTime > 30 && order.timeLeft < 30 && !isPanic;
  const timerColor = isPanic ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400';

  const isSlapped = baukaPhase === 'slapped';
  const isDislike = baukaPhase === 'dislike';
  const isLoving = baukaPhase === 'loving';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative flex flex-col items-center justify-end h-48 w-28"
    >
      {/* Bauka dialog bubble (above speech bubble) */}
      <AnimatePresence>
        {isBauka && baukaDialog && (
          <motion.div
            key={baukaDialog}
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "absolute z-30 rounded-2xl px-2.5 py-2 shadow-xl border-2 text-center",
              isLoving
                ? 'bg-rose-500 border-rose-300 -top-24'
                : isDislike
                ? 'bg-slate-700 border-slate-500 -top-24'
                : '-top-20'
            )}
            style={{ minWidth: 80, maxWidth: 100 }}
          >
            <p className={cn(
              "text-[10px] font-black leading-tight",
              isLoving ? 'text-white' : isDislike ? 'text-white' : 'text-slate-800'
            )}>
              {baukaDialog}
            </p>
            <div className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 border-b-2 border-r-2 rotate-45",
              isLoving ? 'bg-rose-500 border-rose-300' : isDislike ? 'bg-slate-700 border-slate-500' : 'bg-white border-slate-200'
            )} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular speech bubble (order request) */}
      <AnimatePresence mode="wait">
        {order.status === 'waiting' && !isDislike && !isSlapped && !isLoving && (
          <motion.div
            key={isPanic ? 'panic' : 'normal'}
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0 }}
            className="absolute -top-10 z-20"
          >
            {isPanic ? (
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
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-rose-500 border-b-2 border-r-2 border-rose-300 rotate-45" />
              </motion.div>
            ) : (
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
                <div className={cn(
                  "absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b-2 border-r-2 rotate-45",
                  isWarning ? 'border-amber-400' : 'border-slate-200'
                )} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction bubble (eating state) */}
      <AnimatePresence>
        {order.status === 'eating' && !baukaDialog && (
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

      {/* CHAPALK button — appears when Bauka pretends to dislike */}
      <AnimatePresence>
        {isDislike && onChapalk && (
          <motion.button
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: [1, 1.06, 1], y: 0 }}
            exit={{ scale: 0 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            onClick={onChapalk}
            className="absolute -top-14 z-40 bg-rose-600 text-white font-black text-[10px] px-2.5 py-1.5 rounded-2xl shadow-xl border-4 border-rose-400 whitespace-nowrap active:scale-90"
          >
            👋 Дать чапалак!
          </motion.button>
        )}
      </AnimatePresence>

      {/* Character body */}
      <motion.button
        disabled={(!canServe || order.status !== 'waiting') && !isDislike}
        onClick={isDislike ? undefined : () => onServe(order.id)}
        animate={
          isSlapped
            ? { x: [0, -20, 18, -15, 12, -8, 5, 0], rotate: [0, -15, 10, -8, 5, 0], y: [0, -8, 0] }
            : isLoving
            ? { y: [0, -12, 0], rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }
            : isDislike
            ? { rotate: [-3, 3, -3], y: [0, -2, 0] }
            : isPanic
            ? { x: [0, -7, 7, -5, 5, -3, 3, 0], y: [0, -5, 2, -3, 0] }
            : order.reaction === 'bauka_wow'
            ? { y: [0, -18, 0], rotate: [0, -8, 8, 0] }
            : {}
        }
        transition={{
          duration: isSlapped ? 0.6 : isLoving ? 0.8 : isDislike ? 1.5 : isPanic ? 0.3 : 0.5,
          repeat: (isLoving || isDislike || isPanic || order.reaction === 'bauka_wow') ? Infinity : 0,
          repeatDelay: isPanic ? 0.05 : 0.3,
        }}
        className={cn(
          "relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg border-4 transition-all z-10",
          character.color,
          canServe && order.status === 'waiting' && !isDislike ? 'border-green-400 scale-105 cursor-pointer' : 'border-transparent',
          isPanic && !isDislike && 'ring-4 ring-rose-400 ring-offset-2 ring-offset-amber-100',
          isLoving && 'ring-4 ring-rose-400 ring-offset-2 border-rose-300',
          isDislike && 'border-slate-500 grayscale-[0.3]',
          isSlapped && 'border-rose-500',
        )}
        whileTap={canServe && order.status === 'waiting' && !isDislike ? { scale: 0.9 } : undefined}
      >
        <div className="text-4xl">{character.animal}</div>

        {/* Stars when loving */}
        <AnimatePresence>
          {isLoving && (
            <>
              {['✨', '💖', '⭐'].map((star, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], x: (i - 1) * 22, y: -28 }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
                  className="absolute pointer-events-none text-sm"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Name tag */}
        <div className={cn(
          "absolute -top-3 px-2 py-0.5 rounded-full text-[9px] font-black shadow-sm whitespace-nowrap",
          isLoving ? 'bg-rose-500 text-white border border-rose-300'
            : isDislike ? 'bg-slate-600 text-white border border-slate-400'
            : isSlapped ? 'bg-rose-600 text-white border border-rose-300'
            : order.reaction === 'bauka_wow' ? 'bg-amber-400 text-amber-900 border border-amber-200'
            : isPanic ? 'bg-rose-500 text-white border border-rose-300'
            : 'bg-white text-slate-800'
        )}>
          {character.name}
        </div>

        {/* Serve indicator */}
        {canServe && order.status === 'waiting' && !isDislike && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow border border-emerald-300"
          >
            Подать!
          </motion.div>
        )}
      </motion.button>

      {/* Timer bar */}
      {order.status === 'waiting' && order.maxTime > 30 && !isDislike && !isLoving && (
        <div className="w-full mt-2 flex flex-col items-center gap-0.5">
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className={cn('h-full rounded-full transition-colors duration-300', timerColor)}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {!isPanic && (
            <div className={cn("text-[9px] font-black tabular-nums", isWarning ? 'text-amber-500' : 'text-slate-400')}>
              ⏱ {order.timeLeft}с
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
