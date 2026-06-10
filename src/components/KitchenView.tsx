import { INGREDIENTS, RECIPES } from '../data';
import { IngredientType, Recipe, RecipeId, PrepItem, ProcessType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Flame } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../utils';

interface Props {
  plate: IngredientType[];
  prepItems: PrepItem[];
  finishedDish: RecipeId | null;
  onClearPlate: () => void;
  onProcessItem: (id: string, action: ProcessType, amount: number) => void;
  onAssembleItem: (item: PrepItem) => void;
  onServe?: () => void;
  plateFlash: 'good' | 'bad' | null;
  activeRecipe: Recipe | null;
  onQuickPick: (ingredientId: IngredientType) => void;
  stock: Record<IngredientType, number>;
}

export function KitchenView({
  plate, prepItems, finishedDish,
  onClearPlate, onProcessItem, onAssembleItem, onServe,
  plateFlash, activeRecipe, onQuickPick, stock,
}: Props) {
  const dish = finishedDish ? RECIPES[finishedDish] : null;

  const [knifeFlash, setKnifeFlash] = useState<string | null>(null);
  const [panShake, setPanShake] = useState<string | null>(null);
  const [steamId, setSteamId] = useState<string | null>(null);
  const [mixSpinId, setMixSpinId] = useState<string | null>(null);

  // Track items that just became ready for pop animation
  const [justReadyIds, setJustReadyIds] = useState<Set<string>>(new Set());
  const prevPrepRef = useRef<PrepItem[]>([]);

  useEffect(() => {
    const newlyReady = prepItems.filter(item =>
      item.state === 'ready' &&
      prevPrepRef.current.find(p => p.id === item.id)?.state !== 'ready'
    );
    if (newlyReady.length > 0) {
      const ids = new Set(newlyReady.map(i => i.id));
      setJustReadyIds(ids);
      setTimeout(() => setJustReadyIds(new Set()), 700);
    }
    prevPrepRef.current = prepItems;
  }, [prepItems]);

  const stoveItems = prepItems.filter(
    item => (INGREDIENTS[item.ingredientId].process === 'cook' || INGREDIENTS[item.ingredientId].process === 'boil') && item.state !== 'ready'
  );
  const boardItems = prepItems.filter(
    item => INGREDIENTS[item.ingredientId].process === 'cut' && item.state !== 'ready'
  );
  const ovenItems = prepItems.filter(
    item => INGREDIENTS[item.ingredientId].process === 'bake' && item.state !== 'ready'
  );
  const mixerItems = prepItems.filter(
    item => INGREDIENTS[item.ingredientId].process === 'mix' && item.state !== 'ready'
  );
  const readyItems = prepItems.filter(
    item => item.state === 'ready' || INGREDIENTS[item.ingredientId].process === 'none'
  );

  // ── CUTTING BOARD ITEM ──
  const renderCuttingItem = (item: PrepItem) => {
    const isCutting = knifeFlash === item.id;
    const isProcessing = item.state === 'processing';
    const handleCut = (amount: number) => {
      setKnifeFlash(item.id);
      setTimeout(() => setKnifeFlash(null), 280);
      onProcessItem(item.id, 'cut', amount);
    };
    return (
      <motion.div
        key={item.id}
        initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}
        className="relative flex flex-col items-center justify-center p-2 cursor-pointer select-none"
        onClick={() => handleCut(22)}
        onPointerMove={e => { if (e.buttons === 1) handleCut(5); }}
        style={{ touchAction: 'none' }}
      >
        {/* Knife animation */}
        <AnimatePresence>
          {isCutting && (
            <motion.div key="knife"
              initial={{ x: -28, y: -8, rotate: -40, opacity: 0 }}
              animate={{ x: 10, y: 10, rotate: 10, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute text-2xl z-20 pointer-events-none"
            >🔪</motion.div>
          )}
        </AnimatePresence>

        {/* Idle knife hint on raw */}
        {!isProcessing && !isCutting && (
          <motion.div
            animate={{ rotate: [0, -15, 0], y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="absolute -right-2 -top-2 text-base pointer-events-none opacity-70"
          >🔪</motion.div>
        )}

        <motion.div
          animate={isCutting
            ? { x: [0, -4, 4, -2, 0], scale: [1, 0.88, 1] }
            : isProcessing
            ? { rotate: [0, -3, 3, -2, 0] }
            : {}}
          transition={{ duration: 0.22, repeat: isProcessing && !isCutting ? Infinity : 0, repeatDelay: 0.4 }}
          className={cn("text-4xl select-none", item.state === 'raw' && 'grayscale brightness-75')}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>
        {item.progress > 0 && item.progress < 100 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
            <div className="w-10 h-2 bg-amber-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
            </div>
            <span className="text-[7px] font-black text-emerald-700 leading-none">{Math.round(item.progress)}%</span>
          </div>
        )}
        {item.state === 'raw' && (
          <motion.div
            animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow"
          >Режь!</motion.div>
        )}
      </motion.div>
    );
  };

  // ── STOVE ITEM ──
  const renderStoveItem = (item: PrepItem) => {
    const isBoil = INGREDIENTS[item.ingredientId].process === 'boil';
    const isShaking = panShake === item.id;
    const isSteaming = steamId === item.id;
    const isProcessing = item.state === 'processing';

    const handleCook = () => {
      setPanShake(item.id);
      setSteamId(item.id);
      setTimeout(() => setPanShake(null), 380);
      setTimeout(() => setSteamId(null), 750);
      onProcessItem(item.id, INGREDIENTS[item.ingredientId].process, 25);
    };

    return (
      <motion.div
        key={item.id}
        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
        className={cn(
          "relative flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer select-none border-2",
          isBoil ? 'bg-blue-100 border-blue-300' : 'bg-orange-100 border-orange-300'
        )}
        onClick={handleCook}
        style={{ touchAction: 'none' }}
      >
        {/* Continuous ambient steam when processing */}
        {isProcessing && [0, 1, 2].map(i => (
          <motion.div
            key={`ambient-${i}`}
            animate={{ y: [0, -18, -30], opacity: [0, 0.7, 0], x: (i - 1) * 6 }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.35, ease: 'easeOut' }}
            className="absolute top-1 text-xs pointer-events-none"
          >💨</motion.div>
        ))}

        {/* Tap steam burst */}
        <AnimatePresence>
          {isSteaming && [0, 1, 2].map(i => (
            <motion.div
              key={`burst-${i}`}
              initial={{ y: 0, opacity: 0.9, x: (i - 1) * 7 }}
              animate={{ y: -28, opacity: 0, x: (i - 1) * 14 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="absolute top-0 text-base pointer-events-none"
            >💨</motion.div>
          ))}
        </AnimatePresence>

        <div className="absolute -bottom-2 text-base pointer-events-none opacity-50 select-none">
          {isBoil ? '🫕' : '🍳'}
        </div>

        <motion.div
          animate={
            isShaking
              ? { rotate: [-8, 8, -5, 5, 0], y: [0, -3, 0] }
              : isProcessing
              ? { y: [0, -2, 0] }
              : {}
          }
          transition={{
            duration: isShaking ? 0.32 : 1.0,
            repeat: isProcessing && !isShaking ? Infinity : 0,
            repeatDelay: 0.1,
          }}
          className={cn(
            "text-4xl select-none z-10",
            item.state === 'raw' ? 'grayscale brightness-75' : isProcessing ? 'drop-shadow-[0_0_6px_rgba(251,146,60,0.8)]' : ''
          )}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>

        {item.progress > 0 && item.progress < 100 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
            <div className="w-10 h-2 bg-orange-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
            </div>
            <span className="text-[7px] font-black text-orange-700 leading-none">{Math.round(item.progress)}%</span>
          </div>
        )}
        {item.state === 'raw' && (
          <motion.div
            animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow"
          >Тапай!</motion.div>
        )}
      </motion.div>
    );
  };

  // ── OVEN ITEM ──
  const renderOvenItem = (item: PrepItem) => {
    const isProcessing = item.state === 'processing';
    return (
      <motion.div
        key={item.id}
        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
        className="relative flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer border-2 bg-red-50 border-red-300"
        onClick={() => onProcessItem(item.id, 'bake', 18)}
        style={{ touchAction: 'none' }}
      >
        {/* Heat shimmer */}
        <motion.div
          animate={{ opacity: isProcessing ? [0.1, 0.35, 0.1] : [0.05, 0.15, 0.05] }}
          transition={{ repeat: Infinity, duration: isProcessing ? 1.0 : 2.5 }}
          className="absolute inset-0 rounded-xl bg-orange-400 pointer-events-none"
        />
        <motion.div
          animate={{ scale: isProcessing ? [1, 1.08, 0.97, 1.05, 1] : [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: isProcessing ? 1.2 : 2.5 }}
          className={cn(
            "text-4xl select-none z-10",
            item.state === 'raw' ? 'grayscale brightness-75' : isProcessing ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : ''
          )}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>
        {item.progress > 0 && item.progress < 100 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
            <div className="w-10 h-2 bg-red-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-red-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
            </div>
            <span className="text-[7px] font-black text-red-700 leading-none">{Math.round(item.progress)}%</span>
          </div>
        )}
        <motion.div
          animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow"
        >Тапай!</motion.div>
      </motion.div>
    );
  };

  // ── MIXER ITEM ──
  const renderMixerItem = (item: PrepItem) => {
    const isSpinning = mixSpinId === item.id;
    const isProcessing = item.state === 'processing';
    const handleMix = (amount: number) => {
      setMixSpinId(item.id);
      setTimeout(() => setMixSpinId(null), 380);
      onProcessItem(item.id, 'mix', amount);
    };
    return (
      <motion.div
        key={item.id}
        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
        className="relative flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer border-2 bg-blue-50 border-blue-300"
        onClick={() => handleMix(22)}
        onPointerMove={e => { if (e.buttons === 1) handleMix(5); }}
        style={{ touchAction: 'none' }}
      >
        <motion.div
          animate={
            isSpinning
              ? { rotate: 360, scale: [1, 1.15, 1] }
              : isProcessing
              ? { rotate: [0, 8, -8, 0] }
              : {}
          }
          transition={{
            duration: isSpinning ? 0.32 : 1.4,
            repeat: isProcessing && !isSpinning ? Infinity : 0,
          }}
          className={cn(
            "text-4xl select-none z-10",
            item.state === 'raw' ? 'grayscale brightness-75' : isProcessing ? 'drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]' : ''
          )}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>
        {item.progress > 0 && item.progress < 100 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
            <div className="w-10 h-2 bg-blue-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
            </div>
            <span className="text-[7px] font-black text-blue-700 leading-none">{Math.round(item.progress)}%</span>
          </div>
        )}
        {item.state === 'raw' && (
          <motion.div
            animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow"
          >Взбивай!</motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-amber-50 relative overflow-hidden">

      {/* 2×2 Station Grid — fixed height so assembly always has room */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 shrink-0" style={{ height: '45%', minHeight: 160, maxHeight: 220 }}>

        {/* CUTTING BOARD */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-amber-500 shadow-md"
          style={{ background: 'linear-gradient(135deg, #d4a055 0%, #b8813a 50%, #d4a055 100%)' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0,0,0,0.12) 7px, rgba(0,0,0,0.12) 8px)' }} />
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 z-10 shrink-0">
            <span className="text-sm">🔪</span>
            <span className="text-[9px] font-black text-amber-900 uppercase tracking-wide">Разделочная</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1 flex-wrap px-1 z-10 overflow-hidden">
            <AnimatePresence>
              {boardItems.map(item => renderCuttingItem(item))}
            </AnimatePresence>
            {boardItems.length === 0 && (
              <div className="text-amber-800/40 text-[9px] font-bold text-center px-1">Овощи</div>
            )}
          </div>
        </div>

        {/* STOVE */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-orange-400 bg-orange-50 shadow-md">
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 shrink-0">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[9px] font-black text-orange-700 uppercase tracking-wide">Плита</span>
            {stoveItems.some(i => i.state === 'processing') && (
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="ml-auto text-sm"
              >🔥</motion.span>
            )}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-orange-200 opacity-20 pointer-events-none">
            <div className="absolute inset-2 rounded-full border-4 border-orange-300">
              <div className="absolute inset-2 rounded-full bg-orange-200" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1 flex-wrap px-1 z-10 overflow-hidden">
            <AnimatePresence>
              {stoveItems.map(item => renderStoveItem(item))}
            </AnimatePresence>
            {stoveItems.length === 0 && (
              <div className="text-orange-300 text-[9px] font-bold text-center px-1">Мясо / Вода</div>
            )}
          </div>
        </div>

        {/* OVEN */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-red-400 shadow-md"
          style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 shrink-0">
            <span className="text-sm">🌡️</span>
            <span className="text-[9px] font-black text-red-700 uppercase tracking-wide">Духовка 180°</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1 flex-wrap px-1 z-10 overflow-hidden">
            <AnimatePresence>
              {ovenItems.map(item => renderOvenItem(item))}
            </AnimatePresence>
            {ovenItems.length === 0 && (
              <div className="text-red-300 text-[9px] font-bold text-center px-1">Выпечка</div>
            )}
          </div>
        </div>

        {/* MIXER */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-blue-300 bg-blue-50 shadow-md">
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 shrink-0">
            <span className="text-sm">🌀</span>
            <span className="text-[9px] font-black text-blue-700 uppercase tracking-wide">Миксер</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1 flex-wrap px-1 z-10 overflow-hidden">
            <AnimatePresence>
              {mixerItems.map(item => renderMixerItem(item))}
            </AnimatePresence>
            {mixerItems.length === 0 && (
              <div className="text-blue-300 text-[9px] font-bold text-center px-1">Крем / Соус</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Pick Bar */}
      {activeRecipe && (
        <div className="bg-white border-y-2 border-amber-200 px-2 py-1 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-sm"
          style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="text-[9px] font-black text-amber-700 uppercase tracking-wide shrink-0 my-auto">
            {activeRecipe.icon}:
          </div>
          {activeRecipe.steps.map((step, idx) => {
            const ing = INGREDIENTS[step.ingredient];
            if (!ing) return null;
            const doneOnPlate = plate[idx] !== undefined;
            const inPrepArea = prepItems.some(p => p.ingredientId === step.ingredient);
            const outOfStock = (stock[step.ingredient] ?? 0) <= 0;
            const disabled = doneOnPlate || inPrepArea || outOfStock;
            return (
              <button
                key={idx}
                disabled={disabled}
                onClick={() => !disabled && onQuickPick(step.ingredient)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-xl border-2 shrink-0 transition-all active:scale-90",
                  doneOnPlate
                    ? 'opacity-25 grayscale border-slate-200 bg-slate-50 cursor-default'
                    : inPrepArea
                    ? 'border-amber-300 bg-amber-50 opacity-50 cursor-default'
                    : outOfStock
                    ? 'opacity-25 grayscale border-slate-200 bg-slate-50 cursor-default'
                    : 'border-amber-400 bg-white shadow-sm cursor-pointer hover:border-orange-500 hover:bg-amber-50'
                )}
              >
                <span className="text-lg leading-none">{ing.icon}</span>
                <span className="text-[9px] font-black text-slate-700 whitespace-nowrap">{ing.name}</span>
                {doneOnPlate && <span className="text-emerald-500 text-xs font-black">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Assembly Zone */}
      <div className="flex-1 bg-white rounded-t-2xl border-t-2 border-amber-200 flex gap-2 p-2 min-h-0 shadow-inner overflow-hidden">

        {/* Ready items column */}
        <div className="w-14 border-r-2 border-amber-100 flex flex-col items-center gap-1 py-1 overflow-y-auto shrink-0"
          style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="text-[7px] font-black text-amber-700 uppercase tracking-wide mb-0.5">Готово</div>
          <AnimatePresence>
            {readyItems.map(item => {
              const isJustReady = justReadyIds.has(item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0, y: -8 }}
                  animate={isJustReady
                    ? { scale: [0, 1.4, 0.9, 1.1, 1], y: 0 }
                    : { scale: 1, y: 0 }}
                  exit={{ scale: 0 }}
                  transition={isJustReady ? { duration: 0.5, times: [0, 0.3, 0.55, 0.8, 1] } : { duration: 0.2 }}
                  className={cn(
                    "relative bg-amber-50 border-2 border-amber-300 rounded-xl p-1.5 cursor-pointer text-2xl active:scale-90 transition-transform shadow-sm",
                    isJustReady && 'ring-2 ring-emerald-400 ring-offset-1'
                  )}
                  onClick={() => onAssembleItem(item)}
                  whileTap={{ scale: 0.82 }}
                >
                  {INGREDIENTS[item.ingredientId].icon}
                  {isJustReady && (
                    <motion.div
                      initial={{ opacity: 1, scale: 0 }}
                      animate={{ opacity: 0, scale: 1.8 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 rounded-xl bg-emerald-300 pointer-events-none"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {readyItems.length === 0 && plate.length === 0 && (
            <div className="opacity-30 text-[7px] font-bold text-center mt-2 text-slate-500">Нажми «Взять»</div>
          )}
        </div>

        {/* Plate + serve */}
        <div className="flex-1 flex flex-col items-center justify-between py-1 relative min-h-0">
          {/* Status label */}
          <div className="text-center shrink-0">
            <span className={cn(
              "text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider",
              finishedDish ? 'bg-emerald-500 text-white shadow-md' : 'bg-amber-100 text-amber-700'
            )}>
              {finishedDish ? `✓ ${dish?.name}` : 'Сборка блюда'}
            </span>
          </div>

          {/* Plate area with flash feedback */}
          <motion.div
            className="flex-1 flex items-center justify-center relative w-full min-h-0"
            animate={
              plateFlash === 'bad'
                ? { x: [0, -8, 8, -6, 6, 0] }
                : plateFlash === 'good'
                ? { scale: [1, 1.06, 1] }
                : {}
            }
            transition={{ duration: 0.35 }}
          >
            {/* Flash overlay */}
            <AnimatePresence>
              {plateFlash && (
                <motion.div
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "absolute inset-0 rounded-2xl pointer-events-none",
                    plateFlash === 'good' ? 'bg-emerald-300' : 'bg-rose-300'
                  )}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {dish ? (
                <motion.div
                  key="dish"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-6xl drop-shadow-xl"
                  >{dish.icon}</motion.div>
                  {onServe && (
                    <motion.button
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: 2, duration: 1.2 }}
                      onClick={onServe}
                      className="bg-emerald-500 text-white rounded-full px-4 py-2 font-black text-sm shadow-lg active:scale-95 border-4 border-emerald-300 whitespace-nowrap"
                    >
                      🍽️ ПОДАТЬ!
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <div className="relative w-28 h-40 flex flex-col items-center justify-end pb-2">
                  <AnimatePresence>
                    {plate.map((ingId, idx) => {
                      const ing = INGREDIENTS[ingId];
                      return (
                        <motion.div
                          key={`${ingId}-${idx}`}
                          initial={{ y: -36, opacity: 0, scale: 0.5 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          exit={{ y: 36, opacity: 0 }}
                          transition={{ type: 'spring', bounce: 0.4 }}
                          className="text-4xl absolute"
                          style={{ bottom: idx * 14 + 4, zIndex: idx + 1 }}
                        >
                          {ing.icon}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {plate.length === 0 && (
                    <div className="absolute bottom-3 opacity-20">
                      <div className="w-24 h-4 rounded-[100%] bg-amber-400" />
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Clear button */}
          <button
            onClick={onClearPlate}
            disabled={plate.length === 0 && prepItems.length === 0}
            className="self-end p-2 bg-rose-100 hover:bg-rose-200 text-rose-500 rounded-full shadow-sm disabled:opacity-20 active:scale-90 transition-all border border-rose-200 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
