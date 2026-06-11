import { motion, AnimatePresence } from 'motion/react';
import { CHARACTERS, CHARACTER_IDS, RECIPES } from '../data';
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

  const isBauka = order.characterId === CHARACTER_IDS.BAUKA;
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative flex flex-col items-center w-28 shrink-0"
    >
      {/* ── SPEECH ZONE (always visible above character) ── */}
      {/* z-20 > character button's z-10: the chapalk button overflows h-14 and must stay tappable */}
      <div className="relative z-20 w-full h-14 flex items-center justify-center px-1">
        <AnimatePresence mode="wait">
          {/* Bauka dialog (highest priority) */}
          {isBauka && baukaDialog ? (
            <motion.div key={`dialog-${baukaDialog}`}
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center gap-1"
            >
              <div className={cn(
                "w-full text-center text-[9px] font-black px-2 py-1.5 rounded-xl leading-snug",
                isLoving ? 'bg-rose-500 text-white shadow-md'
                  : isSlapped ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-700 text-white shadow-md'
              )}>
                {baukaDialog}
              </div>
              {isDislike && onChapalk && (
                <motion.button
                  animate={{ scale: [1, 1.07, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                  style={{ touchAction: 'manipulation' }}
                  onClick={(e) => { e.stopPropagation(); onChapalk(); }}
                  className="bg-rose-600 text-white font-black text-[9px] px-3 py-1 rounded-xl shadow-lg border-2 border-rose-400 active:scale-90 whitespace-nowrap"
                >
                  👋 Дать чапалак!
                </motion.button>
              )}
            </motion.div>
          ) : isDislike && onChapalk ? (
            /* Dislike without dialog text: show chapalk button */
            <motion.div key="chapalk-btn"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
              <motion.button
                animate={{ scale: [1, 1.07, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                style={{ touchAction: 'manipulation' }}
                onClick={(e) => { e.stopPropagation(); onChapalk(); }}
                className="bg-rose-600 text-white font-black text-[10px] px-3 py-1.5 rounded-xl shadow-lg border-2 border-rose-400 active:scale-90 whitespace-nowrap"
              >
                👋 Дать чапалак!
              </motion.button>
            </motion.div>
          ) : order.status === 'eating' ? (
            /* Reaction after eating */
            <motion.div key="eating-reaction"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-0.5"
            >
              {order.reaction === 'bauka_wow' ? (
                <div className="text-2xl animate-bounce">😍💖✨</div>
              ) : order.reaction === 'wow' ? (
                <div className="text-2xl">❤️</div>
              ) : order.reaction === 'sad' ? (
                <div className="text-2xl">🤢</div>
              ) : (
                <div className="text-2xl">👍</div>
              )}
              {order.reaction === 'bauka_wow' && (
                <div className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full border border-rose-300">ВАУ!!!</div>
              )}
            </motion.div>
          ) : order.status === 'waiting' && !isDislike && !isSlapped && !isLoving ? (
            /* Order bubble */
            <motion.div key="order-bubble" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              {isPanic ? (
                <motion.div
                  animate={{ scale: [1, 1.06, 1], backgroundColor: ['#ef4444', '#b91c1c', '#ef4444'] }}
                  transition={{ repeat: Infinity, duration: 0.45 }}
                  className="bg-rose-500 rounded-2xl border-3 border-rose-300 px-2 py-1 flex flex-col items-center shadow-xl"
                  style={{ minWidth: 64 }}
                >
                  <div className="text-rose-100 text-[7px] font-black uppercase tracking-widest leading-none">СПЕШИ!</div>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.45 }}
                    className="text-white font-black tabular-nums leading-none"
                    style={{ fontSize: 30 }}
                  >{order.timeLeft}</motion.div>
                </motion.div>
              ) : (
                <div className={cn(
                  "bg-white border-2 rounded-2xl px-2 py-1 shadow-md flex flex-col items-center relative",
                  isWarning ? 'border-amber-400' : isUrgent ? 'border-orange-400' : 'border-slate-200'
                )} style={{ minWidth: 64 }}>
                  <div className="text-xl leading-none">{recipe.icon}</div>
                  <div className="text-[9px] font-black text-slate-800 text-center leading-tight max-w-16 truncate">
                    {recipe.name}
                  </div>
                  {order.specialRequest && (
                    <div className="bg-purple-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full mt-0.5 whitespace-nowrap">
                      {order.specialRequest === 'extra_hot' ? '🔥 Острее!' :
                       order.specialRequest === 'no_spice' ? '❄️ Без специй' : '🍽️ Двойная'}
                      {order.tip ? ` +${order.tip}` : ''}
                    </div>
                  )}
                  {isUrgent && !isWarning && <div className="absolute -top-2 -right-2 text-sm">⚡</div>}
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── CHARACTER BUTTON ── */}
      <motion.button
        disabled={(!canServe || order.status !== 'waiting') && !isDislike}
        onClick={isDislike ? undefined : () => onServe(order.id)}
        animate={
          isSlapped
            ? { x: [0, -20, 18, -15, 12, -8, 5, 0], rotate: [0, -15, 10, -8, 5, 0], y: [0, -8, 0] }
            : isLoving
            ? { y: [0, -10, 0], rotate: [0, -5, 5, 0], scale: [1, 1.08, 1] }
            : isDislike
            ? { rotate: [-3, 3, -3], y: [0, -2, 0] }
            : isPanic
            ? { x: [0, -7, 7, -5, 5, -3, 3, 0], y: [0, -4, 2, -2, 0] }
            : order.reaction === 'bauka_wow'
            ? { y: [0, -14, 0], rotate: [0, -6, 6, 0] }
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

        {/* Floating hearts when loving */}
        {isLoving && ['✨', '💖', '⭐'].map((star, i) => (
          <motion.div key={i}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], x: (i - 1) * 22, y: -22 }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
            className="absolute pointer-events-none text-sm"
          >{star}</motion.div>
        ))}

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

      {/* ── TIMER BAR ── */}
      {order.status === 'waiting' && order.maxTime > 30 && !isDislike && !isLoving && (
        <div className="w-full mt-1.5 flex flex-col items-center gap-0.5">
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
