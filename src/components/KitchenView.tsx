import { INGREDIENTS, RECIPES } from '../data';
import { IngredientType, Recipe, RecipeId, PrepItem, ProcessType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Flame } from 'lucide-react';
import { useState } from 'react';
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
        <AnimatePresence>
          {isCutting && (
            <motion.div
              key="knife"
              initial={{ x: -28, y: -8, rotate: -40, opacity: 0 }}
              animate={{ x: 10, y: 10, rotate: 10, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute text-2xl z-20 pointer-events-none"
            >🔪</motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={isCutting ? { x: [0, -4, 4, -2, 0], scale: [1, 0.88, 1] } : {}}
          transition={{ duration: 0.22 }}
          className={cn("text-4xl select-none", item.state === 'raw' && 'grayscale brightness-75')}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>
        {item.progress > 0 && item.progress < 100 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-amber-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
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
        <AnimatePresence>
          {isSteaming && [0, 1, 2].map(i => (
            <motion.div
              key={`steam-${i}`}
              initial={{ y: 0, opacity: 0.9, x: (i - 1) * 7 }}
              animate={{ y: -22, opacity: 0, x: (i - 1) * 11 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, delay: i * 0.1 }}
              className="absolute top-0 text-sm pointer-events-none"
            >💨</motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute -bottom-2 text-base pointer-events-none opacity-50 select-none">
          {isBoil ? '🫕' : '🍳'}
        </div>
        <motion.div
          animate={isShaking ? { rotate: [-8, 8, -5, 5, 0], y: [0, -3, 0] } : {}}
          transition={{ duration: 0.32 }}
          className={cn("text-4xl select-none z-10", item.state === 'raw' && 'grayscale brightness-75')}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>
        {item.progress > 0 && item.progress < 100 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-orange-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
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
  const renderOvenItem = (item: PrepItem) => (
    <motion.div
      key={item.id}
      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
      className="relative flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer border-2 bg-red-50 border-red-300"
      onClick={() => onProcessItem(item.id, 'bake', 18)}
      style={{ touchAction: 'none' }}
    >
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute inset-0 rounded-xl bg-orange-400/10 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2 }}
        className={cn("text-4xl select-none z-10", item.state === 'raw' && 'grayscale brightness-75')}
      >
        {INGREDIENTS[item.ingredientId].icon}
      </motion.div>
      {item.progress > 0 && item.progress < 100 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-red-200 rounded-full overflow-hidden">
          <motion.div className="h-full bg-red-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
        </div>
      )}
      <motion.div
        animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow"
      >Тапай!</motion.div>
    </motion.div>
  );

  // ── MIXER ITEM ──
  const renderMixerItem = (item: PrepItem) => {
    const isSpinning = mixSpinId === item.id;
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
          animate={isSpinning ? { rotate: 360 } : {}}
          transition={{ duration: 0.32 }}
          className={cn("text-4xl select-none z-10", item.state === 'raw' && 'grayscale brightness-75')}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>
        {item.progress > 0 && item.progress < 100 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-blue-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
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

      {/* 2×2 Station Grid */}
      <div className="grid grid-cols-2 gap-2 p-2 h-[46%] shrink-0">

        {/* CUTTING BOARD */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-amber-500 shadow-md"
          style={{ background: 'linear-gradient(135deg, #d4a055 0%, #b8813a 50%, #d4a055 100%)' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0,0,0,0.12) 7px, rgba(0,0,0,0.12) 8px)' }} />
          <div className="flex items-center gap-1 px-2 pt-1.5 pb-1 z-10 shrink-0">
            <span className="text-lg">🔪</span>
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide">Разделочная</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 flex-wrap px-1 z-10">
            <AnimatePresence>
              {boardItems.map(item => renderCuttingItem(item))}
            </AnimatePresence>
            {boardItems.length === 0 && (
              <div className="text-amber-700/40 text-[10px] font-bold">Положи овощи</div>
            )}
          </div>
        </div>

        {/* STOVE */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-orange-400 bg-orange-50 shadow-md">
          <div className="flex items-center gap-1 px-2 pt-1.5 pb-1 shrink-0">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-black text-orange-700 uppercase tracking-wide">Плита</span>
            {stoveItems.length > 0 && (
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1 }}
                className="ml-auto text-base"
              >🔥</motion.span>
            )}
          </div>
          {/* Burner ring visual */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-orange-200 opacity-25 pointer-events-none">
            <div className="absolute inset-2 rounded-full border-4 border-orange-300">
              <div className="absolute inset-2 rounded-full bg-orange-200" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 flex-wrap px-1 z-10">
            <AnimatePresence>
              {stoveItems.map(item => renderStoveItem(item))}
            </AnimatePresence>
            {stoveItems.length === 0 && (
              <div className="text-orange-300 text-[10px] font-bold">Положи мясо / воду</div>
            )}
          </div>
        </div>

        {/* OVEN */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-red-400 shadow-md"
          style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
          <div className="flex items-center gap-1 px-2 pt-1.5 pb-1 shrink-0">
            <span className="text-base">🌡️</span>
            <span className="text-[10px] font-black text-red-700 uppercase tracking-wide">Духовка 180°C</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 flex-wrap px-1 z-10">
            <AnimatePresence>
              {ovenItems.map(item => renderOvenItem(item))}
            </AnimatePresence>
            {ovenItems.length === 0 && (
              <div className="text-red-300 text-[10px] font-bold">Положи выпечку</div>
            )}
          </div>
        </div>

        {/* MIXER */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-blue-300 bg-blue-50 shadow-md">
          <div className="flex items-center gap-1 px-2 pt-1.5 pb-1 shrink-0">
            <span className="text-base">🌀</span>
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wide">Миксер</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 flex-wrap px-1 z-10">
            <AnimatePresence>
              {mixerItems.map(item => renderMixerItem(item))}
            </AnimatePresence>
            {mixerItems.length === 0 && (
              <div className="text-blue-300 text-[10px] font-bold">Положи крем</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Pick Bar */}
      {activeRecipe && (
        <div className="bg-white border-y-2 border-amber-200 px-2 py-1.5 flex items-center gap-2 overflow-x-auto shrink-0 shadow-sm" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="text-[9px] font-black text-amber-700 uppercase tracking-wide shrink-0 my-auto">
            {activeRecipe.icon} Взять:
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
                  "flex items-center gap-1 px-2 py-1 rounded-xl border-2 shrink-0 transition-all active:scale-90",
                  doneOnPlate
                    ? 'opacity-25 grayscale border-slate-200 bg-slate-50 cursor-default'
                    : inPrepArea
                    ? 'border-amber-300 bg-amber-50 opacity-50 cursor-default'
                    : outOfStock
                    ? 'opacity-25 grayscale border-slate-200 bg-slate-50 cursor-default'
                    : 'border-amber-400 bg-white shadow-sm cursor-pointer hover:border-orange-500 hover:bg-amber-50'
                )}
              >
                <span className="text-xl leading-none">{ing.icon}</span>
                <span className="text-[9px] font-black text-slate-700 whitespace-nowrap">{ing.name}</span>
                {doneOnPlate && <span className="text-emerald-500 text-xs font-black">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Assembly Zone */}
      <div className="flex-1 bg-white rounded-t-2xl border-t-2 border-amber-200 flex gap-2 p-2 min-h-0 shadow-inner">

        {/* Ready items column */}
        <div className="w-16 border-r-2 border-amber-100 flex flex-col items-center gap-1.5 py-1 overflow-y-auto shrink-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="text-[8px] font-black text-amber-700 uppercase tracking-wide mb-0.5">Готово</div>
          <AnimatePresence>
            {readyItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ scale: 0, y: -8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}
                className="bg-amber-50 border-2 border-amber-300 rounded-xl p-1.5 cursor-pointer text-2xl active:scale-90 transition-transform shadow-sm"
                onClick={() => onAssembleItem(item)}
                whileTap={{ scale: 0.85 }}
              >
                {INGREDIENTS[item.ingredientId].icon}
              </motion.div>
            ))}
          </AnimatePresence>
          {readyItems.length === 0 && plate.length === 0 && (
            <div className="opacity-30 text-[8px] font-bold text-center mt-3 text-slate-500">Нажми «Взять»</div>
          )}
        </div>

        {/* Plate + serve */}
        <div className="flex-1 flex flex-col items-center justify-between py-2 relative min-h-0">
          {/* Status label */}
          <div className="text-center">
            <span className={cn(
              "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider",
              finishedDish ? 'bg-emerald-500 text-white shadow-md' : 'bg-amber-100 text-amber-700'
            )}>
              {finishedDish ? `✓ ${dish?.name}` : 'Сборка блюда'}
            </span>
          </div>

          {/* Plate area with flash feedback */}
          <motion.div
            className="flex-1 flex items-center justify-center relative w-full"
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
                  <div className="text-7xl drop-shadow-xl">{dish.icon}</div>
                  {onServe && (
                    <motion.button
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ repeat: Infinity, duration: 1.4 }}
                      onClick={onServe}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-full px-5 py-2 font-black text-base shadow-lg active:scale-95 border-4 border-emerald-300 whitespace-nowrap"
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
                          initial={{ y: -36, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 36, opacity: 0 }}
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
            className="self-end p-2 bg-rose-100 hover:bg-rose-200 text-rose-500 rounded-full shadow-sm disabled:opacity-20 active:scale-90 transition-all border border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
