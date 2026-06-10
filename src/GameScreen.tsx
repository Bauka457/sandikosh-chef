import { useState, useEffect, useRef } from 'react';
import { CustomerCard } from './components/CustomerCard';
import { KitchenView } from './components/KitchenView';
import { StorageView } from './components/StorageView';
import { RecipeBookModal } from './components/RecipeBookModal';
import { CHARACTERS, INGREDIENTS, RECIPES } from './data';
import { IngredientType, Order, RecipeId, PrepItem } from './types';
import { Coins, LogOut, BookOpen, Utensils, ChevronDown, ChevronUp, ShoppingBag, Zap, Clock } from 'lucide-react';
import { cn } from './utils';
import { motion, AnimatePresence } from 'motion/react';

const checkRecipeCompletion = (plate: IngredientType[]): RecipeId | null => {
  for (const [id, recipe] of Object.entries(RECIPES)) {
    if (plate.length !== recipe.steps.length) continue;
    let match = true;
    for (let i = 0; i < recipe.steps.length; i++) {
      if (plate[i] !== recipe.steps[i].ingredient) { match = false; break; }
    }
    if (match) return id as RecipeId;
  }
  return null;
};

interface GameScreenProps {
  onQuit: () => void;
  mode: import('./App').GameMode;
  playerName: string;
}

const DONENESS_LABEL: Record<string, string> = {
  'rare': '🩸 С кровью',
  'medium-rare': '🟠 Средне-сырое',
  'medium': '🟡 Средняя',
  'well-done': '✅ Прожарено',
  'crispy': '🟤 Хрустящее',
  'al-dente': '🍝 Аль денте',
  'golden': '🟨 Золотистое',
  'fully-cooked': '✅ Готово',
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: '⭐ Легко',
  2: '⭐⭐ Средне',
  3: '⭐⭐⭐ Сложно',
};

const MAX_CONCURRENT = 3; // guest mode max simultaneous orders

export function GameScreen({ onQuit, mode, playerName }: GameScreenProps) {
  const [coins, setCoins] = useState(0);
  const [activeTab, setActiveTab] = useState<'kitchen' | 'storage'>('kitchen');
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false); // collapsed by default — doesn't block kitchen

  // Speed boost: timestamp until which boost is active
  const [speedBoostEnd, setSpeedBoostEnd] = useState<number | null>(null);
  const [speedBoostSecsLeft, setSpeedBoostSecsLeft] = useState(0);

  // plate flash feedback: 'good' | 'bad' | null
  const [plateFlash, setPlateFlash] = useState<'good' | 'bad' | null>(null);
  // wrong dish info
  const [wrongDishInfo, setWrongDishInfo] = useState<{ expected: string; got: string } | null>(null);

  const [plate, setPlate] = useState<IngredientType[]>([]);
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const [finishedDish, setFinishedDish] = useState<RecipeId | null>(null);

  const [tutorialStep, setTutorialStep] = useState(mode !== 'free' ? 1 : 0);
  const [orders, setOrders] = useState<Order[]>([]);
  const nextOrderId = useRef(1);
  const nextPrepId = useRef(1);

  // Stock tracking (mirrors maxStock minus in-prep)
  const stock = Object.fromEntries(
    Object.values(INGREDIENTS).map(i => [
      i.id,
      i.maxStock - prepItems.filter(p => p.ingredientId === i.id).length,
    ])
  );

  // Auto-spawn orders for guests mode
  useEffect(() => {
    if (tutorialStep > 0) return;
    if (mode === 'bauka') {
      if (orders.length === 0) {
        setOrders([{
          id: `order-${nextOrderId.current++}`,
          characterId: 'bauka',
          recipeId: 'classic_burger',
          maxTime: 999, timeLeft: 999, status: 'waiting',
        }]);
      }
      return;
    }
    if (mode !== 'guests') return;

    const active = orders.filter(o => o.status !== 'done').length;
    if (active >= MAX_CONCURRENT) return;

    const delay = orders.length === 0 ? 0 : 1200;
    const t = setTimeout(spawnCustomer, delay);
    return () => clearTimeout(t);
  }, [tutorialStep, orders, mode]);

  // Auto-dismiss wrong dish notification after 3 seconds
  useEffect(() => {
    if (!wrongDishInfo) return;
    const t = setTimeout(() => setWrongDishInfo(null), 3000);
    return () => clearTimeout(t);
  }, [wrongDishInfo]);

  // Speed boost countdown display
  useEffect(() => {
    if (!speedBoostEnd) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((speedBoostEnd - Date.now()) / 1000));
      setSpeedBoostSecsLeft(left);
      if (left === 0) setSpeedBoostEnd(null);
    }, 250);
    return () => clearInterval(interval);
  }, [speedBoostEnd]);

  // Countdown timer
  useEffect(() => {
    if (mode !== 'guests' || tutorialStep > 0) return;
    const interval = setInterval(() => {
      setOrders(prev => prev.map(o => {
        if (o.status !== 'waiting') return o;
        const newTime = o.timeLeft - 1;
        if (newTime <= 0) {
          setTimeout(() => setOrders(c => c.filter(x => x.id !== o.id)), 2200);
          return { ...o, timeLeft: 0, status: 'eating', reaction: 'sad' };
        }
        return { ...o, timeLeft: newTime };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, tutorialStep]);

  const spawnCustomer = () => {
    const validChars = CHARACTERS.filter(c => c.id !== 'bauka');
    const char = validChars[Math.floor(Math.random() * validChars.length)];
    const recipeIds = Object.keys(RECIPES) as RecipeId[];
    const recipeId = recipeIds[Math.floor(Math.random() * recipeIds.length)];
    setOrders(prev => [
      ...prev.filter(o => o.status !== 'done'),
      {
        id: `order-${nextOrderId.current++}`,
        characterId: char.id,
        recipeId,
        maxTime: 90,
        timeLeft: 90,
        status: 'waiting',
      },
    ]);
  };

  const handleTakeIngredient = (id: IngredientType) => {
    const currentCount = prepItems.filter(i => i.ingredientId === id).length;
    if (currentCount >= INGREDIENTS[id].maxStock) return;
    setPrepItems(prev => [
      ...prev,
      {
        id: `prep-${nextPrepId.current++}`,
        ingredientId: id,
        state: INGREDIENTS[id].process === 'none' ? 'ready' : 'raw',
        progress: 0,
      },
    ]);
  };

  const handleProcessItem = (id: string, action: import('./types').ProcessType, amount: number) => {
    const boosted = speedBoostEnd !== null && Date.now() < speedBoostEnd;
    const finalAmount = boosted ? amount * 2 : amount;
    setPrepItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const ing = INGREDIENTS[item.ingredientId];
      const max = ing.processRequired || 100;
      const newProgress = Math.min(100, item.progress + (finalAmount / max) * 100);
      if (newProgress >= 100) return { ...item, progress: 100, state: 'ready' };
      return { ...item, progress: newProgress, state: 'processing' };
    }));
  };

  const handleBuyBoost = () => {
    if (coins < 20) return;
    setCoins(c => c - 20);
    setSpeedBoostEnd(Date.now() + 30_000);
    setSpeedBoostSecsLeft(30);
    setShopOpen(false);
  };

  const handleBuyTime = () => {
    if (coins < 15) return;
    const target = [...orders]
      .filter(o => o.status === 'waiting')
      .sort((a, b) => a.timeLeft - b.timeLeft)[0];
    if (!target) return;
    setCoins(c => c - 15);
    setOrders(prev => prev.map(o =>
      o.id === target.id ? { ...o, timeLeft: Math.min(o.maxTime, o.timeLeft + 20) } : o
    ));
    setShopOpen(false);
  };

  const handleAssembleItem = (item: PrepItem) => {
    if (item.state !== 'ready') return;

    // Check if this ingredient is the correct next step for the active order
    const waitingOrder = orders.find(o => o.status === 'waiting');
    if (waitingOrder && mode !== 'free') {
      const expectedRecipe = RECIPES[waitingOrder.recipeId];
      const expectedIngredient = expectedRecipe?.steps[plate.length]?.ingredient;
      if (expectedIngredient && expectedIngredient !== item.ingredientId) {
        // Wrong ingredient — red flash but still add (player can clear)
        setPlateFlash('bad');
        setTimeout(() => setPlateFlash(null), 500);
      } else {
        setPlateFlash('good');
        setTimeout(() => setPlateFlash(null), 350);
      }
    }

    setPlate(prev => {
      const newPlate = [...prev, item.ingredientId];
      const completed = checkRecipeCompletion(newPlate);
      if (completed) setFinishedDish(completed);
      return newPlate;
    });
    setPrepItems(prev => prev.filter(i => i.id !== item.id));
  };

  const handleClearPlate = () => {
    setPlate([]);
    setFinishedDish(null);
    setPrepItems([]);
    setWrongDishInfo(null);
  };

  const handleServe = (orderId?: string) => {
    if (!finishedDish) return;

    if (mode === 'free') {
      setCoins(c => c + RECIPES[finishedDish].price);
      handleClearPlate();
      return;
    }

    // Find target order: specified or most urgent waiting
    const targetOrder = orderId
      ? orders.find(o => o.id === orderId && o.status === 'waiting')
      : [...orders]
          .filter(o => o.status === 'waiting')
          .sort((a, b) => a.timeLeft - b.timeLeft)[0];

    if (!targetOrder) return;

    const recipeMatched = targetOrder.recipeId === finishedDish;
    const isBauka = targetOrder.characterId === 'bauka';
    let earned = 0;
    let reaction: Order['reaction'] = 'good';

    if (recipeMatched) {
      earned = RECIPES[targetOrder.recipeId].price;
      const timeRatio = targetOrder.timeLeft / targetOrder.maxTime;
      if (isBauka) { reaction = 'bauka_wow'; earned *= 2; }
      else if (timeRatio > 0.6) { reaction = 'wow'; earned += 15; }
      else if (timeRatio < 0.2) { reaction = 'sad'; earned = Math.floor(earned * 0.5); }
      else { reaction = 'good'; }
      setWrongDishInfo(null);
    } else {
      reaction = 'sad';
      setWrongDishInfo({
        expected: RECIPES[targetOrder.recipeId].name,
        got: RECIPES[finishedDish]?.name ?? '?',
      });
    }

    setCoins(c => c + earned);
    setOrders(prev => prev.map(o =>
      o.id === targetOrder.id ? { ...o, status: 'eating', reaction } : o
    ));
    setTimeout(() => {
      setOrders(prev => prev.filter(o => o.id !== targetOrder.id));
    }, 2400);

    handleClearPlate();
  };

  // Most urgent waiting order for hint / quick serve
  const waitingOrders = orders.filter(o => o.status === 'waiting');
  const sortedWaiting = [...waitingOrders].sort((a, b) => a.timeLeft - b.timeLeft);
  const mostUrgentId = sortedWaiting[0]?.id ?? null;
  const activeOrder = sortedWaiting[0] ?? orders.find(o => o.status === 'eating');
  const activeRecipe = activeOrder ? RECIPES[activeOrder.recipeId] : null;

  return (
    <div className="w-full h-full flex flex-col bg-amber-50 overflow-hidden relative">
      {isBookOpen && <RecipeBookModal onClose={() => setIsBookOpen(false)} />}

      {/* Shop Modal */}
      <AnimatePresence>
        {shopOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end justify-center"
            onClick={() => setShopOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="bg-white w-full rounded-t-3xl border-t-4 border-amber-400 shadow-2xl p-5 pb-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">🛒 Магазин</h3>
                  <p className="text-xs font-bold text-slate-400">Тратить монеты с умом</p>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-full font-black text-amber-700 border-2 border-amber-300">
                  <Coins className="w-4 h-4" /> {coins} монет
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Speed Boost */}
                <div className={cn(
                  "flex items-center gap-3 bg-yellow-50 border-2 rounded-2xl p-3",
                  coins >= 20 ? 'border-yellow-400' : 'border-slate-200 opacity-50'
                )}>
                  <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow">⚡</div>
                  <div className="flex-1">
                    <div className="font-black text-slate-800 text-sm">Буст кухни</div>
                    <div className="text-[11px] font-bold text-slate-500">×2 скорость всех станций на 30 сек</div>
                    {speedBoostEnd && (
                      <div className="text-[10px] font-black text-yellow-600 mt-0.5">Активен: {speedBoostSecsLeft}с</div>
                    )}
                  </div>
                  <button
                    disabled={coins < 20}
                    onClick={handleBuyBoost}
                    className="shrink-0 bg-yellow-400 text-yellow-900 font-black text-sm px-3 py-1.5 rounded-full shadow active:scale-95 disabled:opacity-40 border-2 border-yellow-300 flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" /> 20
                  </button>
                </div>

                {/* Extra Time */}
                <div className={cn(
                  "flex items-center gap-3 bg-blue-50 border-2 rounded-2xl p-3",
                  coins >= 15 && waitingOrders.length > 0 ? 'border-blue-400' : 'border-slate-200 opacity-50'
                )}>
                  <div className="w-12 h-12 bg-blue-400 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow">⏳</div>
                  <div className="flex-1">
                    <div className="font-black text-slate-800 text-sm">Попросить подождать</div>
                    <div className="text-[11px] font-bold text-slate-500">
                      +20 сек самому нетерпеливому гостю
                      {sortedWaiting[0] && (
                        <span className="text-blue-600"> ({RECIPES[sortedWaiting[0].recipeId]?.name})</span>
                      )}
                    </div>
                  </div>
                  <button
                    disabled={coins < 15 || waitingOrders.length === 0}
                    onClick={handleBuyTime}
                    className="shrink-0 bg-blue-400 text-white font-black text-sm px-3 py-1.5 rounded-full shadow active:scale-95 disabled:opacity-40 border-2 border-blue-300 flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" /> 15
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial overlay */}
      {tutorialStep > 0 && mode !== 'free' && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center text-center"
          >
            <div className="text-6xl mb-3">👨‍🍳</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Привет, {playerName}!</h2>
            <p className="font-bold text-orange-500 mb-3 text-sm">
              {mode === 'bauka' ? '🐻 Готовим для Бауки!' : '🍽️ Ресторан открыт!'}
            </p>
            <div className="bg-orange-50 rounded-2xl p-4 text-left mb-5 w-full space-y-2">
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>📋</span> Смотри подсказку справа вверху — там все шаги рецепта</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>⚡</span> Quick Pick (полоска под кухней) — бери ингредиенты одним касанием</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>🔪</span> Тапай или свайпай на разделочной доске</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>🍳</span> Тапай по мясу на плите чтобы пожарить</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>✅</span> Готово → тапни → добавь на тарелку → ПОДАТЬ!</p>
            </div>
            <button
              onClick={() => setTutorialStep(0)}
              className="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-xl shadow-lg active:scale-95 transition-transform"
            >
              Начать! 🍳
            </button>
          </motion.div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-2 bg-orange-500 border-b-4 border-orange-600 shrink-0 relative z-30 shadow-md">
        <button onClick={onQuit} className="p-2 bg-orange-600 rounded-full text-white active:scale-90 transition-transform shadow">
          <LogOut className="w-4 h-4" />
        </button>
        <h1 className="text-base font-black text-white drop-shadow">🍽️ Кухня Бауки</h1>
        <div className="flex items-center gap-1.5">
          {/* Speed boost indicator */}
          {speedBoostEnd && (
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="flex items-center gap-1 bg-yellow-400 text-yellow-900 rounded-full px-2 py-1 text-[10px] font-black shadow border-2 border-yellow-300"
            >
              <Zap className="w-3 h-3" /> {speedBoostSecsLeft}с
            </motion.div>
          )}
          <button
            onClick={() => setIsBookOpen(true)}
            className="p-2 bg-amber-400 text-white rounded-full shadow active:scale-95 flex items-center justify-center"
            title="100 блюд"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShopOpen(true)}
            className="p-2 bg-amber-400 text-white rounded-full shadow active:scale-95 flex items-center justify-center"
            title="Магазин"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 bg-orange-600 px-2.5 py-1.5 rounded-full font-black text-amber-200 text-sm shadow">
            <Coins className="w-3.5 h-3.5" />
            <span>{coins}</span>
          </div>
        </div>
      </div>

      {/* HINT — top-right corner */}
      {activeRecipe && tutorialStep === 0 && mode !== 'free' && (
        <div className="absolute top-14 right-1 w-44 z-40 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border-2 border-orange-300 overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between px-3 py-2 bg-orange-100 border-b border-orange-200"
              onClick={() => setHintOpen(v => !v)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🐻</span>
                <div className="text-left">
                  <div className="text-[8px] font-black text-orange-600 uppercase tracking-wider">Подсказка</div>
                  <div className="text-[10px] font-black text-slate-800 leading-tight truncate max-w-[80px]">
                    {activeRecipe.name} {activeRecipe.icon}
                  </div>
                </div>
              </div>
              {hintOpen
                ? <ChevronUp className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
            </button>
            <AnimatePresence>
              {hintOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  {/* Meta */}
                  <div className="px-3 pt-2 pb-1 grid grid-cols-2 gap-1">
                    {activeRecipe.servingGrams && (
                      <div className="bg-amber-50 rounded-lg px-2 py-1 text-center border border-amber-100">
                        <div className="text-[7px] font-bold text-amber-600 uppercase">Выход</div>
                        <div className="text-[10px] font-black text-slate-800">{activeRecipe.servingGrams}г</div>
                      </div>
                    )}
                    {activeRecipe.ovenTemp && (
                      <div className="bg-orange-50 rounded-lg px-2 py-1 text-center border border-orange-100">
                        <div className="text-[7px] font-bold text-orange-600 uppercase">Духовка</div>
                        <div className="text-[10px] font-black text-orange-700">{activeRecipe.ovenTemp}°C</div>
                      </div>
                    )}
                    {activeRecipe.doneness && (
                      <div className="bg-amber-50 rounded-lg px-2 py-1 text-center border border-amber-100">
                        <div className="text-[7px] font-bold text-amber-600 uppercase">Готовность</div>
                        <div className="text-[8px] font-black text-slate-700">{DONENESS_LABEL[activeRecipe.doneness]}</div>
                      </div>
                    )}
                    {activeRecipe.difficulty && (
                      <div className="bg-amber-50 rounded-lg px-2 py-1 text-center border border-amber-100">
                        <div className="text-[7px] font-bold text-amber-600 uppercase">Сложность</div>
                        <div className="text-[9px] font-black text-yellow-600">{DIFFICULTY_LABEL[activeRecipe.difficulty]}</div>
                      </div>
                    )}
                  </div>

                  {/* Tip */}
                  {activeRecipe.tip && (
                    <div className="mx-3 mb-1.5 bg-amber-50 border border-amber-200 rounded-xl p-2">
                      <p className="text-[9px] font-bold text-amber-800 leading-snug">💡 {activeRecipe.tip}</p>
                    </div>
                  )}

                  {/* Steps */}
                  <div className="px-3 pb-3 flex flex-col gap-1 max-h-36 overflow-y-auto">
                    <div className="text-[7px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Шаги:</div>
                    {activeRecipe.steps.map((step, idx) => {
                      const isDone = plate[idx] === step.ingredient;
                      const isCurrent = idx === plate.length;
                      const ing = INGREDIENTS[step.ingredient];
                      if (!ing) return null;
                      let actionText = '✋ Взять';
                      if (ing.process === 'cook') actionText = '🍳 Жарить';
                      if (ing.process === 'cut') actionText = '🔪 Резать';
                      if (ing.process === 'bake') actionText = '🌡️ Печь';
                      if (ing.process === 'mix') actionText = '🌀 Взбить';
                      if (ing.process === 'boil') actionText = '💧 Варить';
                      return (
                        <div key={idx} className={cn(
                          "flex items-center gap-1.5 rounded-xl p-1.5 transition-all",
                          isDone ? 'opacity-25 grayscale bg-slate-50'
                            : isCurrent ? 'bg-orange-100 border-2 border-orange-400 shadow-sm'
                              : 'bg-amber-50'
                        )}>
                          <div className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-sm shrink-0 shadow-sm">{ing.icon}</div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-orange-700 leading-none">{actionText}</span>
                            <span className="text-[8px] font-bold text-slate-500 leading-none truncate">
                              {ing.name}{ing.grams ? ` · ${ing.grams}г` : ''}
                            </span>
                          </div>
                          {isDone && <span className="ml-auto text-emerald-500 font-black text-sm shrink-0">✓</span>}
                          {isCurrent && !isDone && <span className="ml-auto text-orange-500 font-black text-sm shrink-0">←</span>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Wrong dish notification */}
      <AnimatePresence>
        {wrongDishInfo && (
          <motion.div
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white rounded-2xl px-4 py-2.5 shadow-xl border-4 border-rose-300 text-center"
          >
            <div className="text-xs font-black">😢 Не то блюдо!</div>
            <div className="text-[10px] font-bold opacity-90">
              Хотели: <span className="font-black">{wrongDishInfo.expected}</span>
            </div>
            <div className="text-[10px] font-bold opacity-90">
              Получили: <span className="font-black">{wrongDishInfo.got}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOMERS AREA */}
      {mode !== 'free' ? (
        <div className="bg-amber-100 relative flex items-end pb-3 gap-3 px-4 overflow-x-auto overflow-y-hidden shrink-0 border-b-4 border-orange-300 shadow-inner"
          style={{ minHeight: '10rem' }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 2px, transparent 2px)', backgroundSize: '18px 18px' }} />
          <div className="absolute bottom-0 w-full h-6 bg-orange-300 rounded-t-xl" />
          <AnimatePresence>
            {orders.map(order => order.status === 'done' ? null : (
              <div key={order.id} className="relative z-10 shrink-0">
                <CustomerCard
                  order={order}
                  onServe={() => handleServe(order.id)}
                  canServe={finishedDish !== null && order.status === 'waiting'}
                  isUrgent={order.id === mostUrgentId}
                />
              </div>
            ))}
          </AnimatePresence>
          {orders.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-amber-500/50 text-xs font-black uppercase tracking-wider">
              Ждём гостей…
            </div>
          )}
        </div>
      ) : (
        <div className="h-16 bg-orange-100 relative flex flex-col justify-center items-center shrink-0 border-b-2 border-orange-200">
          <div className="text-base font-black text-orange-700 flex items-center gap-2">👨‍🍳 Свободная Готовка</div>
          <p className="text-[9px] font-bold text-orange-500 mt-0.5">Открой «100 Блюд» и экспериментируй!</p>
        </div>
      )}

      {/* NAV TABS */}
      <div className="flex justify-center px-2 py-1.5 bg-orange-50 gap-2 shrink-0 z-20 border-b border-orange-200">
        <button
          onClick={() => setActiveTab('kitchen')}
          className={cn(
            "flex-1 py-2 px-4 rounded-2xl font-black text-sm transition-all border-b-4 active:border-b-0 active:translate-y-0.5 flex items-center justify-center gap-1.5",
            activeTab === 'kitchen'
              ? 'bg-orange-500 text-white border-orange-700 shadow-md'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-orange-50'
          )}
        >
          <Utensils className="w-4 h-4" /> Кухня
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={cn(
            "flex-1 py-2 px-4 rounded-2xl font-black text-sm transition-all border-b-4 active:border-b-0 active:translate-y-0.5 flex items-center justify-center gap-1.5",
            activeTab === 'storage'
              ? 'bg-blue-500 text-white border-blue-700 shadow-md'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-blue-50'
          )}
        >
          ❄️ Склад
        </button>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-10">
        {activeTab === 'kitchen' ? (
          <KitchenView
            plate={plate}
            prepItems={prepItems}
            finishedDish={finishedDish}
            onClearPlate={handleClearPlate}
            onProcessItem={handleProcessItem}
            onAssembleItem={handleAssembleItem}
            onServe={mode === 'free' || waitingOrders.length > 0
              ? () => handleServe(waitingOrders.sort((a, b) => a.timeLeft - b.timeLeft)[0]?.id)
              : undefined}
            plateFlash={plateFlash}
            activeRecipe={activeRecipe ?? null}
            onQuickPick={handleTakeIngredient}
            stock={stock}
          />
        ) : (
          <StorageView
            stock={stock}
            onTake={handleTakeIngredient}
          />
        )}
      </div>
    </div>
  );
}
