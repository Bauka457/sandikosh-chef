import { INGREDIENTS, RECIPES } from '../data';
import { IngredientType, Recipe, RecipeId, PrepItem, ProcessType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Flame } from 'lucide-react';
import { useState, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { cn, haptic } from '../utils';
import { playSound } from '../sound';
import { KnifeAnimation } from './KnifeAnimation';

interface Props {
  plate: IngredientType[];
  prepItems: PrepItem[];
  finishedDish: RecipeId | null;
  onClearPlate: () => void;
  onProcessItem: (id: string, action: ProcessType, amount: number) => void;
  onStoveRelease: (id: string) => void;
  onDiscardItem: (id: string) => void;
  onAssembleItem: (item: PrepItem) => void;
  onServe?: () => void;
  plateFlash: 'good' | 'bad' | null;
  activeRecipe: Recipe | null;
  onQuickPick: (ingredientId: IngredientType) => void;
  stock: Record<IngredientType, number>;
}

export function KitchenView({
  plate, prepItems, finishedDish,
  onClearPlate, onProcessItem, onStoveRelease, onDiscardItem, onAssembleItem, onServe,
  plateFlash, activeRecipe, onQuickPick, stock,
}: Props) {
  const dish = finishedDish ? RECIPES[finishedDish] : null;

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
      haptic.medium();
      playSound('ding');
      setTimeout(() => setJustReadyIds(new Set()), 700);
    }
    prevPrepRef.current = prepItems;
  }, [prepItems]);

  // ── Сковорода: температура (греется огнём 🔥, остывает сама) ──
  const [stoveTemp, setStoveTemp] = useState(0);
  const stoveTempRef = useRef(0);
  const heatingRef = useRef(false);
  const [isHeating, setIsHeating] = useState(false);

  // Свежие ссылки для игрового цикла (обходим устаревшие замыкания)
  const processRef = useRef(onProcessItem);
  processRef.current = onProcessItem;
  const fryItemsRef = useRef<PrepItem[]>([]);
  const ovenItemsRef = useRef<PrepItem[]>([]);

  // ── Игровой цикл: нагрев/остывание сковороды, жарка, духовка ──
  useEffect(() => {
    const loop = setInterval(() => {
      const t = stoveTempRef.current;
      const next = heatingRef.current ? Math.min(100, t + 7) : Math.max(0, t - 2);
      if (next !== t) { stoveTempRef.current = next; setStoveTemp(next); }
      // Жарим только на горячей сковороде; чем жарче — тем быстрее (и опаснее)
      if (next >= 35) {
        const amt = next >= 95 ? 9 : next >= 60 ? 6 : 2.5;
        fryItemsRef.current.forEach(it => {
          if (it.state !== 'burned') processRef.current(it.id, 'cook', amt);
        });
      }
      // Духовка печёт сама
      ovenItemsRef.current.forEach(it => {
        if (it.state !== 'burned' && it.progress < 100) processRef.current(it.id, 'bake', 2.5);
      });
    }, 150);
    return () => clearInterval(loop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startHeating = () => {
    heatingRef.current = true;
    setIsHeating(true);
    haptic.light();
    playSound('sizzle');
  };
  const stopHeating = () => {
    heatingRef.current = false;
    setIsHeating(false);
  };

  // ── Помешивание (кастрюля и миксер): круговые движения пальцем ──
  const stirRef = useRef<Map<string, { lastAngle: number; accum: number }>>(new Map());
  const [stirTick, setStirTick] = useState<Record<string, number>>({});

  const pointerAngle = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
  };

  const makeStirHandlers = (station: string, items: PrepItem[], action: ProcessType) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (items.length === 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      stirRef.current.set(station, { lastAngle: pointerAngle(e), accum: 0 });
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      const s = stirRef.current.get(station);
      if (!s || items.length === 0) return;
      const angle = pointerAngle(e);
      let d = angle - s.lastAngle;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      s.lastAngle = angle;
      s.accum += Math.abs(d);
      if (s.accum >= 60) { // каждые 60° дуги — шаг прогресса
        s.accum -= 60;
        haptic.light();
        setStirTick(prev => ({ ...prev, [station]: (prev[station] ?? 0) + 1 }));
        items.forEach(it => processRef.current(it.id, action, 8));
      }
    },
    onPointerUp: () => stirRef.current.delete(station),
    onPointerCancel: () => stirRef.current.delete(station),
  });

  const fryItems = prepItems.filter(
    item => INGREDIENTS[item.ingredientId].process === 'cook' && item.state !== 'ready'
  );
  const potItems = prepItems.filter(
    item => INGREDIENTS[item.ingredientId].process === 'boil' && item.state !== 'ready'
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
  fryItemsRef.current = fryItems;
  ovenItemsRef.current = ovenItems;

  // ── СКОВОРОДА: жарится сама на горячей сковороде; готовое снимай тапом ──
  const renderFryItem = (item: PrepItem) => {
    const isBurned = item.state === 'burned';
    const isDone = !isBurned && item.progress >= 100;
    const isCooking = item.state === 'processing' && !isDone && stoveTemp >= 35;
    const isBurning = isDone && stoveTemp >= 35; // готово, но всё ещё на огне — скоро сгорит

    return (
      <motion.div
        key={item.id}
        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
        className={cn(
          "relative flex flex-col items-center justify-center p-1.5 rounded-xl cursor-pointer select-none border-2 transition-colors",
          isBurned ? 'bg-slate-200 border-slate-400'
            : isBurning ? 'bg-rose-100 border-rose-400'
            : isDone ? 'bg-emerald-50 border-emerald-400'
            : 'bg-orange-100 border-orange-300'
        )}
        onClick={() => {
          if (isBurned) { haptic.medium(); onDiscardItem(item.id); }
          else if (isDone) { haptic.success(); onStoveRelease(item.id); }
        }}
        style={{ touchAction: 'manipulation', minWidth: 52, minHeight: 52 }}
      >
        {/* Пар, пока жарится */}
        {isCooking && [0, 1, 2].map(i => (
          <motion.div
            key={`steam-${i}`}
            animate={{ y: [0, -18, -30], opacity: [0, 0.7, 0], x: (i - 1) * 6 }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.35, ease: 'easeOut' }}
            className="absolute top-0 text-xs pointer-events-none"
          >💨</motion.div>
        ))}

        <div className="absolute -bottom-2 text-base pointer-events-none opacity-50 select-none">🍳</div>

        <motion.div
          animate={isCooking ? { y: [0, -2, 0], rotate: [-2, 2, -2] } : isDone && !isBurned ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: isCooking ? 0.5 : 0.8 }}
          className={cn(
            "text-3xl select-none z-10",
            isBurned ? 'grayscale brightness-50 contrast-125'
              : item.state === 'raw' ? 'grayscale brightness-75'
              : isCooking ? 'drop-shadow-[0_0_6px_rgba(251,146,60,0.8)]' : ''
          )}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>

        {!isBurned && !isDone && item.progress > 0 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-9 h-2 bg-orange-200 rounded-full overflow-hidden z-10">
            <motion.div className="h-full bg-orange-500 rounded-full"
              animate={{ width: `${Math.min(100, item.progress)}%` }} transition={{ duration: 0.15 }} />
          </div>
        )}
        {item.state === 'raw' && stoveTemp < 35 && (
          <motion.div
            animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow z-20"
          >Грей! 🔥</motion.div>
        )}
        {isDone && !isBurning && (
          <motion.div
            animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow z-20"
          >✅ Сними!</motion.div>
        )}
        {isBurning && (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.3 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow z-20"
          >🔥 СНИМАЙ!</motion.div>
        )}
        {isBurned && (
          <motion.div
            animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow z-20"
          >Сгорело! Тапни 🗑️</motion.div>
        )}
      </motion.div>
    );
  };

  // ── ПОМЕШИВАЕМОЕ (кастрюля / миксер): прогресс — от круговых движений по станции ──
  const renderStirItem = (item: PrepItem, station: 'pot' | 'mixer') => {
    const isProcessing = item.state === 'processing';
    const isPot = station === 'pot';
    const rotation = (stirTick[station] ?? 0) * 60;
    return (
      <motion.div
        key={item.id}
        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
        className="relative flex flex-col items-center justify-center p-1.5 select-none pointer-events-none"
        style={{ minWidth: 52, minHeight: 52 }}
      >
        {/* Пузырьки в кастрюле */}
        {isPot && isProcessing && [0, 1, 2].map(i => (
          <motion.div key={`bub-${i}`}
            animate={{ y: [4, -16], opacity: [0, 0.8, 0], x: (i - 1) * 8 }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.3 }}
            className="absolute top-0 text-[10px]"
          >🫧</motion.div>
        ))}
        <div className="absolute -bottom-2 text-base pointer-events-none opacity-50 select-none">
          {isPot ? '🫕' : '🥣'}
        </div>
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className={cn(
            "text-3xl z-10",
            item.state === 'raw' ? 'grayscale brightness-75'
              : isProcessing ? 'drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]' : ''
          )}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>
        {item.progress > 0 && item.progress < 100 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-9 h-2 bg-blue-200 rounded-full overflow-hidden z-10">
            <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
          </div>
        )}
        {item.state === 'raw' && (
          <motion.div
            animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm z-20"
          >🌀</motion.div>
        )}
      </motion.div>
    );
  };

  // ── ДУХОВКА: печётся сама (игровой цикл), тап ускоряет; на 100% уходит в «Готово» ──
  const renderOvenItem = (item: PrepItem) => {
    const isProcessing = item.state === 'processing' || item.progress > 0;
    return (
      <motion.div
        key={item.id}
        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
        className="relative flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer border-2 bg-red-50 border-red-300 select-none"
        onClick={() => onProcessItem(item.id, 'bake', 18)}
        style={{ touchAction: 'manipulation', minWidth: 52, minHeight: 52 }}
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
            "text-3xl select-none z-10",
            item.state === 'raw' ? 'grayscale brightness-75' : isProcessing ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : ''
          )}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>
        {item.progress > 0 && item.progress < 100 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-9 h-2 bg-red-200 rounded-full overflow-hidden z-10">
            <motion.div className="h-full bg-red-500 rounded-full" animate={{ width: `${item.progress}%` }} transition={{ duration: 0.2 }} />
          </div>
        )}
        {item.state === 'raw' && (
          <motion.div
            animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow z-20"
          >Печётся… 🔥</motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Голубая кафельная столешница, как на референсе кухни */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)',
      }} />
      <div className="absolute inset-0 pointer-events-none opacity-50" style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.7) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.7) 2px, transparent 2px)',
        backgroundSize: '34px 34px',
      }} />

      {/* 2×2 Station Grid — гибкая высота: делит место с зоной сборки, не вылезая за экран */}
      <div className="grid grid-cols-2 grid-rows-2 gap-1.5 p-1.5 min-h-0 relative z-10" style={{ flex: '1.5 1 0' }}>

        {/* CUTTING BOARD — светлая столешница, чтобы доска KnifeAnimation выделялась */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-amber-300 bg-amber-50 shadow-md">
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 z-10 shrink-0">
            <span className="text-sm">🔪</span>
            <span className="text-[9px] font-black text-amber-800 uppercase tracking-wide">Разделочная</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5 flex-wrap px-1 z-10 overflow-hidden">
            <AnimatePresence>
              {boardItems.map(item => (
                <motion.div
                  key={item.id}
                  className="h-full min-w-0 flex items-center justify-center"
                  initial={{ scale: 0, y: -16 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0 }}
                >
                  <KnifeAnimation
                    icon={INGREDIENTS[item.ingredientId].icon}
                    progress={item.progress}
                    state={item.state}
                    onCut={(amount) => onProcessItem(item.id, 'cut', amount)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {boardItems.length === 0 && (
              <div className="text-amber-800/40 text-[9px] font-bold text-center px-1">Овощи</div>
            )}
          </div>
        </div>

        {/* STOVE — зажми и держи, чтобы греть; сними вовремя, иначе сгорит */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-orange-400 bg-orange-50 shadow-md select-none"
          onPointerDown={startHeating}
          onPointerUp={stopHeating}
          onPointerLeave={stopHeating}
          onPointerCancel={stopHeating}
          style={{ touchAction: 'none' }}
        >
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 shrink-0 z-10">
            <Flame className={cn("w-3.5 h-3.5", isHeating ? 'text-rose-500' : 'text-orange-400')} />
            <span className="text-[9px] font-black text-orange-700 uppercase tracking-wide">Плита</span>
            {/* Шкала нагрева */}
            <div className="ml-auto w-12 h-2 rounded-full bg-orange-100 overflow-hidden border border-orange-200">
              <motion.div
                className={cn("h-full rounded-full", stoveTemp >= 80 ? 'bg-rose-500' : stoveTemp >= 35 ? 'bg-orange-500' : 'bg-emerald-400')}
                animate={{ width: `${stoveTemp}%` }} transition={{ duration: 0.15 }}
              />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1 flex-wrap px-1 z-10 overflow-hidden">
            <AnimatePresence>
              {fryItems.map(item => renderFryItem(item))}
            </AnimatePresence>
            {fryItems.length === 0 && (
              <div className="text-orange-300 text-[9px] font-bold text-center px-1">Мясо · зажми 🔥</div>
            )}
          </div>
        </div>

        {/* POT — мешай пальцем по кругу */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-cyan-400 bg-cyan-50 shadow-md">
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 shrink-0 z-10">
            <span className="text-sm">🫕</span>
            <span className="text-[9px] font-black text-cyan-700 uppercase tracking-wide">Кастрюля</span>
          </div>
          <div
            className="flex-1 flex items-center justify-center gap-1 flex-wrap px-1 z-10 overflow-hidden"
            style={{ touchAction: 'none' }}
            {...makeStirHandlers('pot', potItems, 'boil')}
          >
            <AnimatePresence>
              {potItems.map(item => renderStirItem(item, 'pot'))}
            </AnimatePresence>
            {potItems.length === 0 && (
              <div className="text-cyan-300 text-[9px] font-bold text-center px-1">Суп / Каша</div>
            )}
          </div>
        </div>

        {/* MIXER — круговые движения пальцем */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-blue-300 bg-blue-50 shadow-md">
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 shrink-0 z-10">
            <span className="text-sm">🌀</span>
            <span className="text-[9px] font-black text-blue-700 uppercase tracking-wide">Миксер</span>
          </div>
          <div
            className="flex-1 flex items-center justify-center gap-1 flex-wrap px-1 z-10 overflow-hidden"
            style={{ touchAction: 'none' }}
            {...makeStirHandlers('mixer', mixerItems, 'mix')}
          >
            <AnimatePresence>
              {mixerItems.map(item => renderStirItem(item, 'mixer'))}
            </AnimatePresence>
            {mixerItems.length === 0 && (
              <div className="text-blue-300 text-[9px] font-bold text-center px-1">Крем / Соус</div>
            )}
          </div>
        </div>
      </div>

      {/* OVEN — печётся сама, занимает узкую полосу */}
      <div className="relative z-10 mx-1.5 mb-1 rounded-2xl overflow-hidden flex items-center border-4 border-red-400 shadow-md shrink-0"
        style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', height: 52 }}>
        <div className="flex items-center gap-1 px-2 shrink-0 z-10">
          <span className="text-sm">🌡️</span>
          <span className="text-[9px] font-black text-red-700 uppercase tracking-wide leading-tight">Духовка<br/>180°</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 flex-wrap px-1 z-10 overflow-hidden py-1">
          <AnimatePresence>
            {ovenItems.map(item => renderOvenItem(item))}
          </AnimatePresence>
          {ovenItems.length === 0 && (
            <div className="text-red-300 text-[9px] font-bold text-center px-1">Выпечка</div>
          )}
        </div>
      </div>

      {/* Quick Pick Bar */}
      {activeRecipe ? (
        <div className="relative z-10 bg-white border-y-2 border-amber-200 px-2 py-1 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-sm"
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
      ) : (
        /* Free mode без рецепта: показываем все ингредиенты, чтобы было понятно как готовить */
        <div className="relative z-10 bg-white border-y-2 border-amber-200 px-2 py-1 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-sm"
          style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="text-[9px] font-black text-amber-700 uppercase tracking-wide shrink-0 my-auto">Все:</div>
          {Object.values(INGREDIENTS).map(ing => (
            <button key={ing.id} onClick={() => onQuickPick(ing.id)}
              disabled={(stock[ing.id] ?? 0) <= 0}
              title={ing.name}
              className="flex items-center px-2 py-0.5 rounded-xl border-2 shrink-0 border-amber-400 bg-white shadow-sm active:scale-90 disabled:opacity-30 disabled:grayscale">
              <span className="text-lg leading-none">{ing.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* Assembly Zone */}
      <div className="relative z-10 bg-white rounded-t-2xl border-t-2 border-amber-200 flex gap-2 p-2 min-h-0 shadow-inner overflow-hidden"
        style={{ flex: '1 1 0', minHeight: 120 }}>

        {/* Ready items column */}
        <div className="w-16 border-r-2 border-amber-100 flex flex-col items-center gap-1 py-1 overflow-y-auto shrink-0"
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
                    "relative bg-amber-50 border-2 border-amber-300 rounded-xl p-2 cursor-pointer text-3xl active:scale-90 transition-transform shadow-sm flex items-center justify-center",
                    isJustReady && 'ring-2 ring-emerald-400 ring-offset-1'
                  )}
                  style={{ minWidth: 44, minHeight: 44 }}
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
                  <motion.button
                    animate={onServe ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: 2, duration: 1.2 }}
                    onClick={onServe}
                    disabled={!onServe}
                    className={cn(
                      "rounded-full px-4 py-2 font-black text-sm shadow-lg border-4 whitespace-nowrap",
                      onServe
                        ? "bg-emerald-500 text-white border-emerald-300 active:scale-95"
                        : "bg-slate-200 text-slate-400 border-slate-100 cursor-not-allowed"
                    )}
                  >
                    {onServe ? '🍽️ ПОДАТЬ!' : '⏳ Нет заказов'}
                  </motion.button>
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
