import { INGREDIENTS, RECIPES } from '../data';
import { IngredientType, Recipe, RecipeId, PrepItem, ProcessType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Flame } from 'lucide-react';
import { useState, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { cn, haptic } from '../utils';
import { playSound } from '../sound';
import { KnifeAnimation } from './KnifeAnimation';
import { Knob, Flames } from './StationDecor';

// Сколько резов нужно для продукта: больше processRequired — больше движений ножом.
// Держим в диапазоне 4–8, чтобы резать всегда несколько раз, а не один свайп.
const chopsForItem = (id: IngredientType) => {
  const req = INGREDIENTS[id]?.processRequired ?? 30;
  return Math.max(4, Math.min(8, Math.round(req / 7)));
};

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

  // ── Drag-and-drop сборка: тащим готовый ингредиент на тарелку ──
  const dropRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragInfoRef = useRef<{ over: boolean; moved: boolean } | null>(null);
  const [drag, setDrag] = useState<{ item: PrepItem; x: number; y: number; over: boolean; moved: boolean } | null>(null);

  // Статус ингредиента относительно собираемого блюда:
  // 'next' — класть сейчас (зелёный), 'later' — нужен позже (жёлтый),
  // 'wrong' — не из этого блюда (красный), 'ok' — рецепта нет (нейтрально)
  const ingredientStatus = (ingredientId: IngredientType): 'next' | 'later' | 'wrong' | 'ok' => {
    if (!activeRecipe) return 'ok';
    const expected = activeRecipe.steps[plate.length]?.ingredient;
    if (ingredientId === expected) return 'next';
    if (activeRecipe.steps.slice(plate.length).some(s => s.ingredient === ingredientId)) return 'later';
    return 'wrong';
  };
  const dragWillAccept = drag ? ingredientStatus(drag.item.ingredientId) === 'next' : false;

  const makeDragHandlers = (item: PrepItem) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      // Указатель НЕ захватываем сразу — иначе список «Готово» не прокрутить.
      // Решим по первому движению: вертикаль → скролл, горизонталь → перетаскивание.
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      dragInfoRef.current = { over: false, moved: false };
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      const start = dragStartRef.current;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;

      // Перетаскивание ещё не началось — определяем намерение
      if (!dragInfoRef.current?.moved) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
          // Вертикальный жест — это прокрутка списка, драг отменяем
          dragStartRef.current = null;
          return;
        }
        if (Math.abs(dx) > 8) {
          // Горизонтальный жест — начинаем перетаскивание, теперь захватываем указатель
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          dragInfoRef.current = { over: false, moved: true };
          setDrag({ item, x: e.clientX, y: e.clientY, over: false, moved: true });
        }
        return;
      }

      const zone = dropRef.current?.getBoundingClientRect();
      const over = !!zone && e.clientX >= zone.left && e.clientX <= zone.right
        && e.clientY >= zone.top && e.clientY <= zone.bottom;
      dragInfoRef.current = { over, moved: true };
      setDrag({ item, x: e.clientX, y: e.clientY, over, moved: true });
    },
    onPointerUp: () => {
      const info = dragInfoRef.current;
      const started = dragStartRef.current !== null;
      dragStartRef.current = null;
      dragInfoRef.current = null;
      setDrag(null);
      if (!info) return;                       // драг был отменён прокруткой
      if (!info.moved && started) onAssembleItem(item); // тап на месте → положить
      else if (info.moved && info.over) onAssembleItem(item); // отпустили над тарелкой
    },
    onPointerCancel: () => {
      dragStartRef.current = null;
      dragInfoRef.current = null;
      setDrag(null);
    },
  });

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
    // чистим счётчик переворотов для кусков, которых уже нет на сковороде
    setFlips(prev => {
      const live = new Set(prepItems.map(p => p.id));
      let changed = false;
      const next: Record<string, number> = {};
      for (const k in prev) { if (live.has(k)) next[k] = prev[k]; else changed = true; }
      return changed ? next : prev;
    });
    prevPrepRef.current = prepItems;
  }, [prepItems]);

  // ── Сковорода: температура (греется при включённой конфорке, остывает сама) ──
  const [stoveTemp, setStoveTemp] = useState(0);
  // Сколько раз перевернули каждый кусок на сковороде (для реалистичной прожарки)
  const [flips, setFlips] = useState<Record<string, number>>({});
  const flipItem = (id: string) => {
    haptic.medium();
    playSound('sizzle');
    setFlips(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };
  const stoveTempRef = useRef(0);
  const heatingRef = useRef(false);
  const [isHeating, setIsHeating] = useState(false);

  // ── Духовка: включается кнопкой, дверца открывается с анимацией ──
  const [ovenOn, setOvenOn] = useState(false);
  const ovenOnRef = useRef(false);

  const toggleHeat = () => {
    const v = !heatingRef.current;
    heatingRef.current = v;
    setIsHeating(v);
    haptic.medium();
    playSound(v ? 'sizzle' : 'ding');
  };
  const toggleOven = () => {
    const v = !ovenOnRef.current;
    ovenOnRef.current = v;
    setOvenOn(v);
    haptic.medium();
    playSound(v ? 'sizzle' : 'ding');
  };

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
      // Духовка печёт, только когда включена
      if (ovenOnRef.current) {
        ovenItemsRef.current.forEach(it => {
          if (it.state !== 'burned' && it.progress < 100) processRef.current(it.id, 'bake', 2.5);
        });
      }
    }, 150);
    return () => clearInterval(loop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ── СКОВОРОДА: жарится сама на горячей сковороде; переворачивай и снимай вовремя ──
  const renderFryItem = (item: PrepItem) => {
    const isBurned = item.state === 'burned';
    const isDone = !isBurned && item.progress >= 100;
    const isCooking = item.state === 'processing' && !isDone && stoveTemp >= 35;
    const isBurning = isDone && stoveTemp >= 35; // готово, но всё ещё на огне — скоро сгорит
    const flipCount = flips[item.id] ?? 0;
    // на середине прожарки нужно перевернуть кусок (как на настоящей сковороде)
    const needsFlip = isCooking && flipCount === 0 && item.progress >= 45;

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
          else if (isCooking) { flipItem(item.id); } // тап по жарящемуся — переворот
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

        {/* Переворот: кусок делает сальто по оси Y на каждый тап */}
        <motion.div
          animate={{ rotateY: flipCount * 180 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="z-10"
        >
        <motion.div
          animate={isCooking ? { y: [0, -2, 0], rotate: [-2, 2, -2] } : isDone && !isBurned ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: isCooking ? 0.5 : 0.8 }}
          className={cn(
            "text-3xl select-none",
            isBurned ? 'grayscale brightness-50 contrast-125'
              : item.state === 'raw' ? 'grayscale brightness-75'
              : isCooking ? 'drop-shadow-[0_0_6px_rgba(251,146,60,0.8)]' : ''
          )}
        >
          {INGREDIENTS[item.ingredientId].icon}
        </motion.div>
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
        {needsFlip && (
          <motion.div
            animate={{ scale: [1, 1.12, 1], rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 0.7 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap shadow z-20"
          >🔄 Переверни!</motion.div>
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
        className="relative flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer border-2 bg-black/25 border-orange-300/40 select-none"
        onClick={() => { if (ovenOnRef.current) onProcessItem(item.id, 'bake', 18); }}
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
          >{ovenOn ? 'Печётся… 🔥' : 'Включи 🔥'}</motion.div>
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

      {/* Прокручиваемая зона техники: станции получают полноценную высоту и
          НИЧЕГО не обрезается — если не помещается на экран, просто прокручиваем. */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto">
      {/* 2×2 Station Grid — фиксированная комфортная высота, чтобы продукты и
          подсказки всегда влезали целиком */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 p-2 relative z-10 shrink-0" style={{ minHeight: 320 }}>

        {/* CUTTING BOARD — деревянная столешница */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-amber-700/50 shadow-md"
          style={{ background: 'linear-gradient(180deg, #f6dcab 0%, #e9c184 100%)' }}>
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 z-10 shrink-0">
            <span className="text-sm">🔪</span>
            <span className="text-[9px] font-black text-amber-900 uppercase tracking-wide">Разделочная</span>
          </div>
          {/* плиточный фартук сзади */}
          <div className="absolute top-0 left-0 right-0 h-1/3 opacity-25 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(#fff7 1px,transparent 1px),linear-gradient(90deg,#fff7 1px,transparent 1px)', backgroundSize: '16px 16px' }} />
          <div className="flex-1 flex items-center justify-center gap-1.5 flex-wrap px-1 py-1 z-10 overflow-visible">
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
                    chopsNeeded={chopsForItem(item.ingredientId)}
                    onCut={(amount) => onProcessItem(item.id, 'cut', amount)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {boardItems.length === 0 && (
              <div className="text-amber-900/40 text-[9px] font-bold text-center px-1">Овощи</div>
            )}
          </div>
        </div>

        {/* STOVE — металлическая плита: включи конфорку ручкой, сними вовремя */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-slate-600 shadow-md select-none"
          style={{ background: 'linear-gradient(180deg,#64748b 0%,#475569 55%,#1e293b 100%)' }}>
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 shrink-0 z-20">
            <Flame className={cn("w-3.5 h-3.5", isHeating ? 'text-rose-400' : 'text-slate-400')} />
            <span className="text-[9px] font-black text-slate-50 uppercase tracking-wide">Плита</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-9 h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
                <motion.div
                  className={cn("h-full rounded-full", stoveTemp >= 80 ? 'bg-rose-500' : stoveTemp >= 35 ? 'bg-orange-500' : 'bg-emerald-400')}
                  animate={{ width: `${stoveTemp}%` }} transition={{ duration: 0.15 }}
                />
              </div>
              <Knob on={isHeating} onToggle={toggleHeat} tone="orange" />
            </div>
          </div>
          <div className="flex-1 relative flex items-center justify-center gap-1 flex-wrap px-1 pt-2.5 pb-2 overflow-visible">
            {/* конфорка */}
            <div className="absolute left-1/2 bottom-1 -translate-x-1/2 rounded-full pointer-events-none z-0"
              style={{ width: 60, height: 60, background: 'radial-gradient(circle at 50% 45%, #334155 0%, #1e293b 52%, #0f172a 56%, #64748b 60%, #1e293b 66%)' }} />
            <Flames active={isHeating} />
            <div className="relative z-10 flex items-center justify-center gap-1 flex-wrap">
              <AnimatePresence>
                {fryItems.map(item => renderFryItem(item))}
              </AnimatePresence>
            </div>
            {fryItems.length === 0 && (
              <div className="text-slate-300/70 text-[9px] font-bold text-center px-1 z-10">Мясо · грей 🔥 · переворачивай 🔄</div>
            )}
          </div>
        </div>

        {/* POT — стальная кастрюля, мешай пальцем по кругу */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-cyan-400 shadow-md"
          style={{ background: 'linear-gradient(180deg,#e0f2fe,#bae6fd)' }}>
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 shrink-0 z-20">
            <span className="text-sm">🍲</span>
            <span className="text-[9px] font-black text-cyan-800 uppercase tracking-wide">Кастрюля</span>
            <span className="ml-auto text-[7px] font-black text-cyan-600">мешай 🌀</span>
          </div>
          <div
            className="flex-1 relative flex items-center justify-center px-1 pt-2.5 pb-2 overflow-visible"
            style={{ touchAction: 'none' }}
            {...makeStirHandlers('pot', potItems, 'boil')}
          >
            {/* тело кастрюли */}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-0 pointer-events-none"
              style={{ width: '80%', height: '74%', borderRadius: '12px 12px 22px 22px', background: 'linear-gradient(180deg,#f1f5f9 0%,#cbd5e1 55%,#94a3b8 100%)', boxShadow: 'inset 0 6px 6px rgba(255,255,255,0.6), inset 0 -8px 10px rgba(0,0,0,0.25)' }} />
            {/* ручки */}
            <div className="absolute z-0 pointer-events-none" style={{ left: '3%', top: '46%', width: 13, height: 7, borderRadius: 6, background: '#64748b' }} />
            <div className="absolute z-0 pointer-events-none" style={{ right: '3%', top: '46%', width: 13, height: 7, borderRadius: 6, background: '#64748b' }} />
            {/* ободок */}
            <div className="absolute left-1/2 -translate-x-1/2 z-0 pointer-events-none" style={{ width: '88%', height: 7, top: '24%', borderRadius: 8, background: 'linear-gradient(180deg,#e2e8f0,#94a3b8)' }} />
            <div className="relative z-10 flex items-center justify-center gap-1 flex-wrap">
              <AnimatePresence>
                {potItems.map(item => renderStirItem(item, 'pot'))}
              </AnimatePresence>
            </div>
            {potItems.length === 0 && (
              <div className="text-cyan-700/50 text-[9px] font-bold text-center px-1 z-10">Суп / Каша</div>
            )}
          </div>
        </div>

        {/* MIXER — чаша с венчиком, круговые движения пальцем */}
        <div className="relative rounded-2xl overflow-hidden flex flex-col border-4 border-violet-300 shadow-md"
          style={{ background: 'linear-gradient(180deg,#ede9fe,#ddd6fe)' }}>
          <div className="flex items-center gap-1 px-2 pt-1 pb-0.5 shrink-0 z-20">
            <span className="text-sm">🥣</span>
            <span className="text-[9px] font-black text-violet-800 uppercase tracking-wide">Миксер</span>
            <span className="ml-auto text-[7px] font-black text-violet-600">мешай 🌀</span>
          </div>
          <div
            className="flex-1 relative flex items-center justify-center px-1 pt-2.5 pb-2 overflow-visible"
            style={{ touchAction: 'none' }}
            {...makeStirHandlers('mixer', mixerItems, 'mix')}
          >
            {/* чаша */}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-0 pointer-events-none"
              style={{ width: '76%', height: '72%', borderRadius: '12px 12px 50% 50%', background: 'linear-gradient(180deg,#f8fafc,#cbd5e1 60%,#94a3b8)', boxShadow: 'inset 0 6px 8px rgba(255,255,255,0.7), inset 0 -6px 8px rgba(0,0,0,0.2)' }} />
            {/* венчик — вращается при помешивании */}
            <motion.div className="absolute left-1/2 top-0.5 -translate-x-1/2 z-20 pointer-events-none text-xl"
              animate={{ rotate: (stirTick['mixer'] ?? 0) * 60 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}>🥄</motion.div>
            <div className="relative z-10 flex items-center justify-center gap-1 flex-wrap">
              <AnimatePresence>
                {mixerItems.map(item => renderStirItem(item, 'mixer'))}
              </AnimatePresence>
            </div>
            {mixerItems.length === 0 && (
              <div className="text-violet-700/50 text-[9px] font-bold text-center px-1 z-10">Крем / Соус</div>
            )}
          </div>
        </div>
      </div>

      {/* OVEN — настоящая духовка: кнопка ВКЛ/ВЫКЛ, дверца открывается с анимацией */}
      <div className="relative z-10 mx-1.5 mb-1 rounded-2xl overflow-hidden flex items-stretch border-4 border-slate-500 shadow-md shrink-0"
        style={{ background: 'linear-gradient(180deg,#64748b,#334155)', height: 74 }}>
        {/* Панель управления */}
        <div className="flex flex-col items-center justify-center gap-0.5 px-3 shrink-0 z-20 border-r-2 border-slate-600/70">
          <span className="text-[9px] font-black text-slate-50 uppercase tracking-wide leading-none">Духовка</span>
          <motion.span className="text-[9px] font-black leading-none"
            animate={{ color: ovenOn ? '#fdba74' : '#64748b' }}>
            {ovenOn ? '180°C' : 'выкл'}
          </motion.span>
          <div className="mt-1.5"><Knob on={ovenOn} onToggle={toggleOven} tone="red" /></div>
        </div>

        {/* Камера с дверцей */}
        <div className="flex-1 relative overflow-hidden" style={{ perspective: 500 }}>
          {/* Внутренняя камера */}
          <div className="absolute inset-1 rounded-lg overflow-hidden"
            style={{ background: ovenOn ? 'linear-gradient(180deg,#9a3412,#c2410c)' : 'linear-gradient(180deg,#1f2937,#111827)' }}>
            {/* решётка */}
            <div className="absolute left-2 right-2 z-0" style={{ top: '38%', height: 2, background: 'rgba(148,163,184,0.5)' }} />
            <div className="absolute left-2 right-2 z-0" style={{ top: '66%', height: 2, background: 'rgba(148,163,184,0.5)' }} />
            {/* жар */}
            {ovenOn && (
              <motion.div className="absolute inset-0 bg-orange-500/30 pointer-events-none"
                animate={{ opacity: [0.2, 0.55, 0.2] }} transition={{ repeat: Infinity, duration: 1.3 }} />
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-2 flex-wrap px-1 py-1 z-10">
              <AnimatePresence>
                {ovenItems.map(item => renderOvenItem(item))}
              </AnimatePresence>
              {ovenItems.length === 0 && (
                <div className={cn("text-[9px] font-bold text-center px-1", ovenOn ? 'text-orange-100/80' : 'text-slate-400')}>
                  {ovenOn ? 'Ставь выпечку' : 'Выпечка · включи 🔥'}
                </div>
              )}
            </div>
          </div>
          {/* Стеклянная дверца — откидывается вниз при включении */}
          <motion.div className="absolute inset-0 z-30 origin-bottom pointer-events-none"
            style={{ transformStyle: 'preserve-3d', background: 'linear-gradient(180deg,#475569,#1e293b)', borderRadius: 8, border: '2px solid #334155' }}
            animate={{ rotateX: ovenOn ? 84 : 0, opacity: ovenOn ? 0.12 : 1 }}
            transition={{ type: 'spring', stiffness: 110, damping: 15 }}>
            {/* стекло */}
            <div className="absolute inset-2 rounded" style={{ background: 'linear-gradient(135deg, rgba(148,163,184,0.45), rgba(30,41,59,0.6))', border: '1px solid #64748b' }} />
            {/* ручка */}
            <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ top: 4, width: '55%', height: 5, background: 'linear-gradient(180deg,#e2e8f0,#94a3b8)' }} />
          </motion.div>
        </div>
      </div>
      </div>{/* /прокручиваемая зона техники */}

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
      <div className="relative z-10 bg-white rounded-t-2xl border-t-2 border-amber-200 flex gap-2 p-2 shrink-0 shadow-inner overflow-hidden"
        style={{ minHeight: 150 }}>

        {/* Ready items column */}
        <div className="w-16 border-r-2 border-amber-100 flex flex-col items-center gap-1 py-1 overflow-y-auto shrink-0"
          style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="text-[7px] font-black text-amber-700 uppercase tracking-wide mb-0.5 text-center leading-tight">Готово<br/>тащи 👉</div>
          <AnimatePresence>
            {readyItems.map(item => {
              const isJustReady = justReadyIds.has(item.id);
              const status = ingredientStatus(item.ingredientId);
              const isDragging = drag?.item.id === item.id && drag.moved;
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
                    "relative rounded-xl p-2 cursor-grab active:cursor-grabbing text-3xl transition-transform shadow-sm flex items-center justify-center border-2",
                    status === 'next' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
                      : status === 'wrong' ? 'bg-rose-50 border-rose-300'
                      : status === 'later' ? 'bg-amber-50 border-amber-300'
                      : 'bg-amber-50 border-amber-300',
                    isJustReady && 'ring-2 ring-emerald-400 ring-offset-1'
                  )}
                  style={{ minWidth: 44, minHeight: 44, touchAction: 'pan-y', opacity: isDragging ? 0.3 : 1 }}
                  {...makeDragHandlers(item)}
                >
                  {INGREDIENTS[item.ingredientId].icon}
                  {/* Кнопка удаления — убрать случайный/лишний ингредиент */}
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); haptic.medium(); onDiscardItem(item.id); }}
                    aria-label="Убрать"
                    className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-slate-700 text-white text-[9px] font-black flex items-center justify-center shadow z-30 active:scale-90 border border-white/40"
                    style={{ touchAction: 'manipulation' }}
                  >✕</button>
                  {/* Цветовая метка статуса (угол) */}
                  {status === 'next' && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center shadow">✓</span>
                  )}
                  {status === 'wrong' && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center shadow">!</span>
                  )}
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
            ref={dropRef}
            className={cn(
              "flex-1 flex items-center justify-center relative w-full min-h-0 rounded-2xl transition-colors",
              drag?.moved && (dragWillAccept ? 'bg-emerald-100/60' : 'bg-rose-100/60')
            )}
            animate={
              plateFlash === 'bad'
                ? { x: [0, -8, 8, -6, 6, 0] }
                : plateFlash === 'good'
                ? { scale: [1, 1.06, 1] }
                : {}
            }
            transition={{ duration: 0.35 }}
          >
            {/* Подсказка зоны при перетаскивании: зелёная — клади, красная — не тот */}
            {drag?.moved && (
              <div className={cn(
                "absolute inset-1 rounded-2xl border-4 border-dashed pointer-events-none z-20 flex items-start justify-center pt-1",
                dragWillAccept ? 'border-emerald-400' : 'border-rose-400'
              )}>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full shadow",
                  dragWillAccept ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                )}>
                  {dragWillAccept ? '✓ Отпусти сюда' : '✕ Не тот ингредиент'}
                </span>
              </div>
            )}
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

      {/* Призрак ингредиента, который тащим пальцем */}
      {drag?.moved && (
        <div
          className="fixed z-200 pointer-events-none -translate-x-1/2 -translate-y-1/2 text-5xl drop-shadow-2xl"
          style={{ left: drag.x, top: drag.y }}
        >
          {INGREDIENTS[drag.item.ingredientId].icon}
        </div>
      )}
    </div>
  );
}
