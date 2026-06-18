import { useState, useEffect, useRef } from 'react';
import { CustomerCard } from './components/CustomerCard';
import { KitchenView } from './components/KitchenView';
import { StorageView } from './components/StorageView';
import { RecipeBookModal } from './components/RecipeBookModal';
import { InstructionModal } from './components/InstructionModal';
import { SelfReviewModal } from './components/SelfReviewModal';
import { CHARACTERS, CHARACTER_IDS, BAUKA_PHRASES, BAUKA_DISLIKE_PHRASES, INGREDIENTS, RECIPES } from './data';
import { IngredientType, Order, RecipeId, PrepItem } from './types';
import {
  addSessionStats, loadProfile, DEFAULT_UPGRADES,
  ACHIEVEMENTS, unlockAchievement, updateDailyProgress, type DailyChallengeType,
} from './profile';
import { playSound } from './sound';
import { Coins, LogOut, BookOpen, Utensils, ChevronDown, ChevronUp, ShoppingBag, Zap, Clock, HelpCircle } from 'lucide-react';
import { type BaukaPhase } from './components/CustomerCard';
import { ComboToast } from './components/ComboToast';
import { BaukaOverlay } from './components/BaukaOverlay';
import { KitchenBackdrop } from './components/KitchenBackdrop';
import { cn, haptic } from './utils';
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
  playerAvatar?: string;
}

const DONENESS_LABEL: Record<string, string> = {
  'rare': '🩸 С кровью', 'medium-rare': '🟠 Средне-сырое', 'medium': '🟡 Средняя',
  'well-done': '✅ Прожарено', 'crispy': '🟤 Хрустящее', 'al-dente': '🍝 Аль денте',
  'golden': '🟨 Золотистое', 'fully-cooked': '✅ Готово',
};
const DIFFICULTY_LABEL: Record<number, string> = { 1: '⭐ Легко', 2: '⭐⭐ Средне', 3: '⭐⭐⭐ Сложно' };
const MAX_CONCURRENT = 3;
const MAX_LIVES = 3;
const WAVE_GOAL = 5;          // блюд для перехода на следующую волну
const OVERHEAT_LIMIT = 125;   // progress, при котором блюдо сгорает на плите
const SPECIAL_REQUESTS = ['extra_hot', 'no_spice', 'large_portion'] as const;
const BAUKA_TARGET = 5;       // блюд в серии для Бауки
const BAUKA_FINALE_BONUS = 150;

export function GameScreen({ onQuit, mode, playerName, playerAvatar = '👨‍🍳' }: GameScreenProps) {
  // ── Session stats + save-once refs ──
  const [coins, setCoins] = useState(0);
  const [dishesServedCount, setDishesServedCount] = useState(0);
  const coinsRef = useRef(0);
  const dishesRef = useRef(0);
  const sessionSavedRef = useRef(false);
  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { dishesRef.current = dishesServedCount; }, [dishesServedCount]);

  // ── Timer cleanup ──
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  // ── Апгрейды кухни (куплены в меню, читаются один раз на сессию) ──
  const [upgrades] = useState(() => loadProfile()?.upgrades ?? { ...DEFAULT_UPGRADES });
  const maxLives = MAX_LIVES + (upgrades.extraLife > 0 ? 1 : 0);
  const overheatLimit = OVERHEAT_LIMIT + upgrades.heatControl * 10;
  const knifeMultiplier = 1 + upgrades.fasterKnife * 0.2;

  // ── Lives & game over ──
  const [lives, setLives] = useState(maxLives);
  const [gameOver, setGameOver] = useState(false);

  // ── Тосты разблокировок (достижения, задание дня) ──
  const [unlockToasts, setUnlockToasts] = useState<{ key: number; icon: string; title: string; sub?: string }[]>([]);
  const nextToastKey = useRef(1);
  const pushUnlockToast = (icon: string, title: string, sub?: string) => {
    const key = nextToastKey.current++;
    setUnlockToasts(prev => [...prev, { key, icon, title, sub }]);
    safeTimeout(() => setUnlockToasts(prev => prev.filter(t => t.key !== key)), 3000);
  };

  const tryUnlock = (id: string) => {
    if (!unlockAchievement(id)) return;
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a) {
      pushUnlockToast(a.icon, `Достижение: ${a.name}`, a.description);
      haptic.success();
      playSound('ding');
    }
  };

  const bumpDaily = (type: DailyChallengeType, value: number) => {
    const res = updateDailyProgress(type, value);
    if (res?.justCompleted) {
      pushUnlockToast('📅', 'Задание дня выполнено!', `+${res.challenge.reward} монет в копилку`);
      haptic.success();
      playSound('combo');
    }
  };

  // Разные блюда за сессию (для достижения «Шеф-повар»)
  const distinctRecipesRef = useRef<Set<string>>(new Set());

  // ── Combo ──
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [comboToast, setComboToast] = useState<number | null>(null);

  // ── Wave progression (guests mode) ──
  const [wave, setWave] = useState(1);
  const [waveNotif, setWaveNotif] = useState<string | null>(null);
  const [waveDishes, setWaveDishes] = useState(0); // блюд подано в текущей волне (цель: WAVE_GOAL)
  const waveServedRef = useRef(0);
  const waveRef = useRef(1);
  useEffect(() => { waveRef.current = wave; }, [wave]);

  // ── Summary modal ──
  const [showSummary, setShowSummary] = useState(false);

  // ── UI state ──
  const [activeTab, setActiveTab] = useState<'kitchen' | 'storage'>('kitchen');
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  // ── Bauka ──
  const [baukaPhase, setBaukaPhase] = useState<BaukaPhase>('idle');
  const [baukaDialog, setBaukaDialog] = useState<string | null>(null);
  const [baukaServed, setBaukaServed] = useState(0);   // подано блюд в серии
  const [baukaFinale, setBaukaFinale] = useState(false);
  const baukaServedRef = useRef(0);
  useEffect(() => { baukaServedRef.current = baukaServed; }, [baukaServed]);

  // ── Free mode ──
  const [freeRecipeId, setFreeRecipeId] = useState<RecipeId | null>(null);
  const [freeReviewOpen, setFreeReviewOpen] = useState(false);

  // ── Speed boost ──
  const [speedBoostEnd, setSpeedBoostEnd] = useState<number | null>(null);
  const [speedBoostSecsLeft, setSpeedBoostSecsLeft] = useState(0);

  // ── Feedback ──
  const [plateFlash, setPlateFlash] = useState<'good' | 'bad' | null>(null);
  const [wrongDishInfo, setWrongDishInfo] = useState<{ expected: string; got: string } | null>(null);

  // ── Cooking state ──
  const [plate, setPlate] = useState<IngredientType[]>([]);
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const [finishedDish, setFinishedDish] = useState<RecipeId | null>(null);

  const [tutorialStep, setTutorialStep] = useState(mode !== 'free' ? 1 : 0);
  const [orders, setOrders] = useState<Order[]>([]);
  const nextOrderId = useRef(1);
  const nextPrepId = useRef(1);

  // Stock: exclude items in prep AND already on the plate
  const stock = Object.fromEntries(
    Object.values(INGREDIENTS).map(i => [
      i.id,
      i.maxStock
        - prepItems.filter(p => p.ingredientId === i.id).length
        - plate.filter(id => id === i.id).length,
    ])
  );

  const saveSession = () => {
    if (sessionSavedRef.current) return;
    sessionSavedRef.current = true;
    addSessionStats(coinsRef.current, dishesRef.current);
  };

  // ── Unmount: clear timers and save ──
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      saveSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lives → game over ──
  useEffect(() => {
    if (lives <= 0 && !gameOver && mode !== 'free') {
      saveSession();
      setGameOver(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lives]);

  // ── Bauka finale → persist session (refs are fresh post-render) ──
  useEffect(() => {
    if (baukaFinale) saveSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baukaFinale]);

  // ── Auto-spawn orders ──
  useEffect(() => {
    if (tutorialStep > 0 || gameOver) return;
    if (mode === 'bauka') {
      if (orders.length === 0 && !baukaFinale && baukaServed < BAUKA_TARGET) {
        const baukaIds = Object.keys(RECIPES).filter(id =>
          ['fastfood', 'meat'].includes(RECIPES[id].category)
        );
        const recipeId = baukaIds[Math.floor(Math.random() * baukaIds.length)] as RecipeId;
        setOrders([{
          id: `order-${nextOrderId.current++}`,
          characterId: CHARACTER_IDS.BAUKA, recipeId,
          maxTime: 999, timeLeft: 999, status: 'waiting',
        }]);
      }
      return;
    }
    if (mode !== 'guests') return;
    const active = orders.filter(o => o.status !== 'done').length;
    if (active >= MAX_CONCURRENT) return;
    const delay = orders.length === 0 ? 0 : 1200;
    const t = setTimeout(() => spawnCustomer(waveRef.current), delay);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialStep, orders, mode, gameOver, baukaFinale, baukaServed]);

  // ── Auto-dismiss wrong dish notification ──
  useEffect(() => {
    if (!wrongDishInfo) return;
    const t = setTimeout(() => setWrongDishInfo(null), 3000);
    return () => clearTimeout(t);
  }, [wrongDishInfo]);

  // ── Speed boost countdown ──
  useEffect(() => {
    if (!speedBoostEnd) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((speedBoostEnd - Date.now()) / 1000));
      setSpeedBoostSecsLeft(left);
      if (left === 0) setSpeedBoostEnd(null);
    }, 250);
    return () => clearInterval(interval);
  }, [speedBoostEnd]);

  // ── Countdown timer ──
  useEffect(() => {
    if (mode !== 'guests' || tutorialStep > 0 || gameOver) return;
    const interval = setInterval(() => {
      setOrders(prev => prev.map(o => {
        if (o.status !== 'waiting') return o;
        const newTime = o.timeLeft - 1;
        if (newTime <= 0) {
          setLives(l => l - 1);
          setCombo(0);
          haptic.error();
          setTimeout(() => setOrders(c => c.filter(x => x.id !== o.id)), 2200);
          return { ...o, timeLeft: 0, status: 'eating', reaction: 'sad' };
        }
        return { ...o, timeLeft: newTime };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, tutorialStep, gameOver]);

  const spawnCustomer = (currentWave: number) => {
    const validChars = CHARACTERS.filter(c => c.id !== CHARACTER_IDS.BAUKA);
    const char = validChars[Math.floor(Math.random() * validChars.length)];
    const minTime = Math.max(40, 90 - (currentWave - 1) * 5) + upgrades.patience * 10;
    let recipePool = Object.keys(RECIPES) as RecipeId[];
    if (currentWave >= 3 && Math.random() < 0.4) {
      const harder = recipePool.filter(id => (RECIPES[id].difficulty ?? 1) >= 2);
      if (harder.length > 0) recipePool = harder;
    }
    if (currentWave >= 5 && Math.random() < 0.3) {
      const hardest = recipePool.filter(id => (RECIPES[id].difficulty ?? 1) >= 3);
      if (hardest.length > 0) recipePool = hardest;
    }
    const recipeId = recipePool[Math.floor(Math.random() * recipePool.length)];
    const hasSpecialRequest = Math.random() < 0.35;
    setOrders(prev => [
      ...prev.filter(o => o.status !== 'done'),
      {
        id: `order-${nextOrderId.current++}`, characterId: char.id, recipeId,
        maxTime: minTime, timeLeft: minTime, status: 'waiting',
        specialRequest: hasSpecialRequest
          ? SPECIAL_REQUESTS[Math.floor(Math.random() * SPECIAL_REQUESTS.length)]
          : undefined,
        tip: hasSpecialRequest ? Math.floor(Math.random() * 15) + 10 : 0,
      },
    ]);
  };

  const handleTakeIngredient = (id: IngredientType) => {
    const currentCount = prepItems.filter(i => i.ingredientId === id).length;
    if (currentCount >= INGREDIENTS[id].maxStock) return;
    setPrepItems(prev => [...prev, {
      id: `prep-${nextPrepId.current++}`,
      ingredientId: id,
      state: INGREDIENTS[id].process === 'none' ? 'ready' : 'raw',
      progress: 0,
    }]);
  };

  const handleProcessItem = (id: string, action: import('./types').ProcessType, amount: number) => {
    const boosted = speedBoostEnd !== null && Date.now() < speedBoostEnd;
    let finalAmount = boosted ? amount * 2 : amount;
    if (action === 'cut' || action === 'mix') finalAmount *= knifeMultiplier; // апгрейд «Острее нож»
    setPrepItems(prev => prev.map(item => {
      if (item.id !== id || item.state === 'burned') return item;
      const ing = INGREDIENTS[item.ingredientId];
      const max = ing.processRequired || 100;
      // Сковорода (cook): прогресс идёт дальше 100 — сними вовремя, иначе сгорит.
      // После 100 жар растёт медленнее, чтобы окно «снять вовремя» было ~1-2 сек.
      // Кастрюля (boil) не сгорает — там скилл в помешивании.
      if (ing.process === 'cook') {
        const rate = item.progress >= 100 ? 0.4 : 1;
        const newProgress = Math.min(overheatLimit, item.progress + (finalAmount / max) * 100 * rate);
        if (newProgress >= overheatLimit) {
          haptic.error();
          playSound('error');
          return { ...item, progress: overheatLimit, state: 'burned' };
        }
        return { ...item, progress: newProgress, state: 'processing' };
      }
      const newProgress = Math.min(100, item.progress + (finalAmount / max) * 100);
      if (newProgress >= 100) return { ...item, progress: 100, state: 'ready' };
      return { ...item, progress: newProgress, state: 'processing' };
    }));
  };

  // Снял блюдо со сковороды: если дожарено (>= 100) и не сгорело — готово
  const handleStoveRelease = (id: string) => {
    setPrepItems(prev => prev.map(item =>
      item.id === id && item.state === 'processing' && item.progress >= 100
        ? { ...item, progress: 100, state: 'ready' }
        : item
    ));
  };

  const handleDiscardItem = (id: string) => {
    setPrepItems(prev => prev.filter(i => i.id !== id));
  };

  // Завершает текущее блюдо Бауки: считает прогресс серии и решает,
  // спавнить следующее блюдо или показать финал.
  const advanceBauka = () => {
    const served = baukaServedRef.current + 1;
    baukaServedRef.current = served;
    setBaukaServed(served);
    setBaukaPhase('idle');
    setBaukaDialog(null);
    handleResetAll();
    if (served >= BAUKA_TARGET) {
      setCoins(c => c + BAUKA_FINALE_BONUS);
      setOrders([]);
      tryUnlock('bauka_fan');
      setBaukaFinale(true); // saveSession вызывается в эффекте ниже (refs уже свежие)
    } else {
      setOrders([]); // запустит спавн следующего блюда
    }
  };

  const baukaPhrase = () =>
    BAUKA_PHRASES[Math.min(baukaServedRef.current, BAUKA_PHRASES.length - 1)];

  const handleChapalk = () => {
    haptic.heavy();
    playSound('chop');
    setBaukaPhase('slapped');
    setBaukaDialog('АЙ!!! 😱');
    safeTimeout(() => {
      setBaukaPhase('loving');
      setBaukaDialog(`Нравится! Нравится!! 😍 ${baukaPhrase()}`);
      safeTimeout(() => advanceBauka(), 3000);
    }, 1000); // даём шлепку доиграться
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
    const target = [...orders].filter(o => o.status === 'waiting').sort((a, b) => a.timeLeft - b.timeLeft)[0];
    if (!target) return;
    setCoins(c => c - 15);
    setOrders(prev => prev.map(o => o.id === target.id ? { ...o, timeLeft: Math.min(o.maxTime, o.timeLeft + 20) } : o));
    setShopOpen(false);
  };

  const handleAssembleItem = (item: PrepItem) => {
    if (item.state !== 'ready') return;

    // Блюдо, которое сейчас собираем — то же, что в подсказке и Quick Pick
    const guideRecipe = mode === 'free'
      ? (freeRecipeId ? RECIPES[freeRecipeId] : null)
      : (() => {
          const urgent = orders.filter(o => o.status === 'waiting')
            .sort((a, b) => a.timeLeft - b.timeLeft)[0];
          return urgent ? RECIPES[urgent.recipeId] : null;
        })();

    // Проверяем: тот ли это ингредиент и в правильном ли порядке.
    // Если нет — возвращаем в «Готово» (не добавляем), тарелку не портим.
    if (guideRecipe) {
      const expected = guideRecipe.steps[plate.length]?.ingredient;
      if (expected !== item.ingredientId) {
        setPlateFlash('bad');
        haptic.error();
        playSound('error');
        setTimeout(() => setPlateFlash(null), 450);
        return;
      }
    }

    setPlateFlash('good');
    haptic.light();
    setTimeout(() => setPlateFlash(null), 300);
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
    setWrongDishInfo(null);
  };

  const handleResetAll = () => {
    setPlate([]);
    setFinishedDish(null);
    setPrepItems([]);
    setWrongDishInfo(null);
  };

  const handleServe = (orderId?: string) => {
    if (!finishedDish) return;

    if (mode === 'free') {
      const price = RECIPES[finishedDish].price;
      setCoins(c => c + price);
      setDishesServedCount(n => n + 1);
      playSound('coin');
      tryUnlock('first_dish');
      distinctRecipesRef.current.add(finishedDish);
      if (distinctRecipesRef.current.size >= 10) tryUnlock('chef_10');
      bumpDaily('dishes', 1);
      bumpDaily('coins', price);
      setFreeReviewOpen(true);
      return; // plate persists until review is dismissed
    }

    const targetOrder = orderId
      ? orders.find(o => o.id === orderId && o.status === 'waiting')
      : [...orders].filter(o => o.status === 'waiting').sort((a, b) => a.timeLeft - b.timeLeft)[0];
    if (!targetOrder) return;

    const recipeMatched = targetOrder.recipeId === finishedDish;
    const isBauka = targetOrder.characterId === CHARACTER_IDS.BAUKA;
    let earned = 0;
    let reaction: Order['reaction'] = 'good';

    if (recipeMatched) {
      earned = RECIPES[targetOrder.recipeId].price;
      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo(bc => Math.max(bc, newCombo));
      const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
      if (newCombo === 3 || newCombo === 5) {
        setComboToast(newCombo);
        haptic.combo(newCombo);
        playSound('combo');
        safeTimeout(() => setComboToast(null), 1500);
      } else {
        haptic.success();
      }
      if (newCombo >= 5) tryUnlock('combo_5');
      bumpDaily('combo', newCombo);

      if (isBauka) {
        earned = earned * 2 * multiplier;
        // Какое это блюдо по счёту в серии (1-е, 2-е, 3-е…)
        const dishNumber = baukaServedRef.current + 1;
        if (dishNumber % 3 === 0) {
          // Каждое 3-е блюдо Баука притворяется недовольным —
          // ждёт «чапалак», прогресс серии не двигается, пока не дашь пощёчину.
          reaction = 'sad';
          setBaukaPhase('dislike');
          setBaukaDialog(BAUKA_DISLIKE_PHRASES[Math.floor(Math.random() * BAUKA_DISLIKE_PHRASES.length)]);
        } else {
          reaction = 'bauka_wow';
          setBaukaPhase('loving');
          setBaukaDialog(baukaPhrase());
          safeTimeout(() => advanceBauka(), 2600);
        }
      } else {
        const timeRatio = targetOrder.timeLeft / targetOrder.maxTime;
        if (timeRatio > 0.6) { reaction = 'wow'; earned = (earned + 15) * multiplier; }
        else if (timeRatio < 0.2) { reaction = 'sad'; earned = Math.floor(earned * 0.5 * multiplier); }
        else { reaction = 'good'; earned = earned * multiplier; }
        earned += targetOrder.tip ?? 0; // чаевые за спецзапрос
        if (timeRatio > 0.8) tryUnlock('speed_cook');
      }

      setWrongDishInfo(null);
      setDishesServedCount(n => n + 1);
      tryUnlock('first_dish');
      distinctRecipesRef.current.add(finishedDish);
      if (distinctRecipesRef.current.size >= 10) tryUnlock('chef_10');
      bumpDaily('dishes', 1);

      if (mode === 'guests') {
        waveServedRef.current++;
        setWaveDishes(waveServedRef.current % WAVE_GOAL);
        if (waveServedRef.current % WAVE_GOAL === 0) {
          const newWave = waveRef.current + 1;
          setWave(newWave);
          waveRef.current = newWave;
          setWaveNotif(`Волна ${newWave}! 🌊`);
          safeTimeout(() => setWaveNotif(null), 2500);
          if (newWave >= 5) tryUnlock('wave_5');
        }
      }
    } else {
      reaction = 'sad';
      setCombo(0);
      setPlateFlash('bad');
      haptic.error();
      playSound('error');
      safeTimeout(() => setPlateFlash(null), 500);
      setWrongDishInfo({
        expected: RECIPES[targetOrder.recipeId]?.name ?? targetOrder.recipeId,
        got: RECIPES[finishedDish]?.name ?? finishedDish,
      });
      // Подали Бауке не то блюдо: не блокируем заказ — оставляем его «waiting»,
      // чтобы можно было приготовить нужное и подать снова (иначе серия зависала).
      if (isBauka) {
        setBaukaPhase('idle');
        setBaukaDialog(null);
        handleResetAll();
        return;
      }
    }

    if (earned > 0) {
      playSound('coin');
      bumpDaily('coins', earned);
      if (coins + earned >= 500) tryUnlock('coins_500');
    }
    setCoins(c => c + earned);
    setOrders(prev => prev.map(o => o.id === targetOrder.id ? { ...o, status: 'eating', reaction } : o));
    if (!isBauka) {
      safeTimeout(() => setOrders(prev => prev.filter(o => o.id !== targetOrder.id)), 2400);
    }
    handleResetAll();
  };

  const handleRestartGame = () => {
    sessionSavedRef.current = false;
    setCoins(0); setDishesServedCount(0);
    distinctRecipesRef.current = new Set();
    setLives(maxLives); setGameOver(false);
    setCombo(0); setBestCombo(0); setComboToast(null);
    setWave(1); waveServedRef.current = 0; waveRef.current = 1; setWaveDishes(0);
    setShowSummary(false); setWaveNotif(null);
    setPlate([]); setPrepItems([]); setFinishedDish(null);
    setOrders([]); setBaukaPhase('idle'); setBaukaDialog(null);
    setBaukaServed(0); baukaServedRef.current = 0; setBaukaFinale(false);
    setSpeedBoostEnd(null); setWrongDishInfo(null);
    setTutorialStep(0);
  };

  const handleQuitToMenu = () => { saveSession(); onQuit(); };

  // ── Derived values ──
  const waitingOrders = orders.filter(o => o.status === 'waiting');
  const sortedWaiting = [...waitingOrders].sort((a, b) => a.timeLeft - b.timeLeft);
  const mostUrgentId = sortedWaiting[0]?.id ?? null;
  const activeOrder = sortedWaiting[0] ?? orders.find(o => o.status === 'eating');
  const activeRecipe = mode === 'free'
    ? (freeRecipeId ? RECIPES[freeRecipeId] : null)
    : (activeOrder ? RECIPES[activeOrder.recipeId] : null);
  const comboMultiplier = combo >= 5 ? 3 : combo >= 3 ? 2 : 1;

  return (
    <div className="w-full h-full flex flex-col bg-amber-50 overflow-hidden relative">
      {/* ── Modals ── */}
      {isBookOpen && (
        <RecipeBookModal
          onClose={() => setIsBookOpen(false)}
          onSelect={mode === 'free' ? (id) => { setFreeRecipeId(id as RecipeId); handleResetAll(); } : undefined}
        />
      )}
      {instructionOpen && <InstructionModal onClose={() => setInstructionOpen(false)} />}
      {freeReviewOpen && activeRecipe && (
        <SelfReviewModal
          recipe={activeRecipe} playerName={playerName}
          onPlayAgain={() => { setFreeReviewOpen(false); handleResetAll(); }}
          onChooseOther={() => { setFreeReviewOpen(false); setFreeRecipeId(null); handleResetAll(); setIsBookOpen(true); }}
        />
      )}

      {/* ── Shop ── */}
      <AnimatePresence>
        {shopOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end justify-center" onClick={() => setShopOpen(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="bg-white w-full rounded-t-3xl border-t-4 border-amber-400 shadow-2xl p-5 pb-8"
              onClick={e => e.stopPropagation()}>
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
                <div className={cn("flex items-center gap-3 bg-yellow-50 border-2 rounded-2xl p-3", coins >= 20 ? 'border-yellow-400' : 'border-slate-200 opacity-50')}>
                  <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow">⚡</div>
                  <div className="flex-1">
                    <div className="font-black text-slate-800 text-sm">Буст кухни</div>
                    <div className="text-[11px] font-bold text-slate-500">×2 скорость всех станций на 30 сек</div>
                    {speedBoostEnd && <div className="text-[10px] font-black text-yellow-600 mt-0.5">Активен: {speedBoostSecsLeft}с</div>}
                  </div>
                  <button disabled={coins < 20} onClick={handleBuyBoost}
                    className="shrink-0 bg-yellow-400 text-yellow-900 font-black text-sm px-3 py-1.5 rounded-full shadow active:scale-95 disabled:opacity-40 border-2 border-yellow-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> 20
                  </button>
                </div>
                <div className={cn("flex items-center gap-3 bg-blue-50 border-2 rounded-2xl p-3", coins >= 15 && waitingOrders.length > 0 ? 'border-blue-400' : 'border-slate-200 opacity-50')}>
                  <div className="w-12 h-12 bg-blue-400 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow">⏳</div>
                  <div className="flex-1">
                    <div className="font-black text-slate-800 text-sm">Попросить подождать</div>
                    <div className="text-[11px] font-bold text-slate-500">
                      +20 сек самому нетерпеливому гостю
                      {sortedWaiting[0] && <span className="text-blue-600"> ({RECIPES[sortedWaiting[0].recipeId]?.name})</span>}
                    </div>
                  </div>
                  <button disabled={coins < 15 || waitingOrders.length === 0} onClick={handleBuyTime}
                    className="shrink-0 bg-blue-400 text-white font-black text-sm px-3 py-1.5 rounded-full shadow active:scale-95 disabled:opacity-40 border-2 border-blue-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 15
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tutorial overlay ── */}
      {tutorialStep > 0 && mode !== 'free' && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center text-center">
            <div className="text-6xl mb-3">👨‍🍳</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Привет, {playerName}!</h2>
            <p className="font-bold text-orange-500 mb-3 text-sm">
              {mode === 'bauka' ? '🐻 Готовим для Бауки!' : '🍽️ Ресторан открыт!'}
            </p>
            <div className="bg-orange-50 rounded-2xl p-4 text-left mb-5 w-full space-y-2">
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>📋</span> Смотри подсказку справа — там все шаги рецепта</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>⚡</span> Quick Pick (полоска под кухней) — бери ингредиенты одним касанием</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>🔪</span> Пили продукты свайпами туда-сюда, как настоящим ножом</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>🍳</span> Плита: крути ручку ВКЛ/ВЫКЛ — загорится огонь. Готовое снимай тапом, не сожги!</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>🔥</span> Духовка: включи ручкой — дверца откроется и выпечка начнёт печься</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>🍲</span> Кастрюлю и миксер мешай круговыми движениями пальца</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>✋</span> Готовое перетащи на тарелку: зелёная подсветка ✓ — верно, красная ✕ — вернётся назад</p>
              <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>✅</span> Собрал блюдо → ПОДАТЬ!</p>
              {mode === 'guests' && <p className="text-[11px] font-bold text-slate-600 flex gap-2"><span>❤️</span> У тебя 3 жизни — не дай гостям уйти!</p>}
            </div>
            <button onClick={() => setTutorialStep(0)}
              className="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-xl shadow-lg active:scale-95 transition-transform">
              Начать! 🍳
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Game Over ── */}
      <AnimatePresence>
        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="text-6xl mb-2">😢</div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">Кухня закрыта!</h2>
              <p className="text-sm text-slate-400 font-bold mb-4">Гости ушли голодными...</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[{ icon: '💰', label: 'Монет', val: coins }, { icon: '🍽️', label: 'Блюд', val: dishesServedCount }, { icon: '🔥', label: 'Лучший комбо', val: bestCombo }].map(s => (
                  <div key={s.label} className="bg-amber-50 rounded-xl p-2 border border-amber-100">
                    <div className="text-xl">{s.icon}</div>
                    <div className="text-lg font-black text-slate-800">{s.val}</div>
                    <div className="text-[9px] text-slate-400 font-bold">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleRestartGame}
                  className="flex-1 py-3 bg-orange-500 text-white font-black rounded-2xl border-b-4 border-orange-700 shadow active:scale-95 text-sm">
                  🔄 Ещё раз
                </button>
                <button onClick={handleQuitToMenu}
                  className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl active:scale-95 text-sm">
                  🏠 В меню
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bauka finale ── */}
      <AnimatePresence>
        {baukaFinale && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-rose-900/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm overflow-hidden">
            {/* Floating hearts */}
            {['💖', '✨', '😍', '⭐', '🎉', '💕'].map((e, i) => (
              <motion.div key={i}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '-20%', opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2.2 + (i % 3) * 0.6, delay: i * 0.3 }}
                className="absolute text-3xl pointer-events-none"
                style={{ left: `${10 + i * 15}%` }}
              >{e}</motion.div>
            ))}
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center relative z-10">
              <motion.div animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.4 }} className="text-6xl mb-1">😍</motion.div>
              <motion.h2 animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}
                className="text-3xl font-black text-rose-500 mb-1 drop-shadow">БРАВИССИМО!</motion.h2>
              <p className="text-sm text-slate-500 font-bold mb-4">
                {playerName}, ты накормил Бауку {BAUKA_TARGET} раз — он твой фанат №1! 🐻💖
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[{ icon: '🍽️', label: 'Блюд', val: baukaServed }, { icon: '💰', label: 'Монет', val: coins }, { icon: '🔥', label: 'Комбо', val: bestCombo }].map(s => (
                  <div key={s.label} className="bg-rose-50 rounded-xl p-2 border border-rose-100">
                    <div className="text-xl">{s.icon}</div>
                    <div className="text-lg font-black text-slate-800">{s.val}</div>
                    <div className="text-[9px] text-slate-400 font-bold">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mb-4 bg-amber-50 rounded-2xl px-4 py-2 border border-amber-200">
                <p className="text-sm font-black text-amber-600">🎉 Бонус фаната: +{BAUKA_FINALE_BONUS} монет</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleRestartGame}
                  className="flex-1 py-3 bg-rose-500 text-white font-black rounded-2xl border-b-4 border-rose-700 shadow active:scale-95 text-sm">
                  🔄 Ещё серия
                </button>
                <button onClick={handleQuitToMenu}
                  className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl active:scale-95 text-sm">
                  🏠 В меню
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Session summary ── */}
      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/70 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="text-5xl mb-2">🏁</div>
              <h2 className="text-xl font-black text-slate-800 mb-1">Итоги сессии</h2>
              <p className="text-xs font-bold text-slate-400 mb-4">{playerAvatar} {playerName}</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[{ icon: '💰', label: 'Монет', val: coins }, { icon: '🍽️', label: 'Блюд', val: dishesServedCount }, { icon: '🔥', label: 'Лучший комбо', val: bestCombo }].map(s => (
                  <div key={s.label} className="bg-amber-50 rounded-xl p-2 border border-amber-100">
                    <div className="text-xl">{s.icon}</div>
                    <div className="text-lg font-black text-slate-800">{s.val}</div>
                    <div className="text-[9px] text-slate-400 font-bold">{s.label}</div>
                  </div>
                ))}
              </div>
              {mode === 'guests' && wave > 1 && (
                <div className="mb-4 bg-blue-50 rounded-2xl px-4 py-2 border border-blue-100">
                  <p className="text-sm font-black text-blue-600">🌊 Достигнута волна {wave}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowSummary(false)}
                  className="flex-1 py-3 bg-orange-500 text-white font-black rounded-2xl border-b-4 border-orange-700 shadow active:scale-95 text-sm">
                  🍳 Играть ещё
                </button>
                <button onClick={handleQuitToMenu}
                  className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl active:scale-95 text-sm">
                  🏠 В меню
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER (two rows) ── */}
      <div className="bg-orange-500 border-b-4 border-orange-600 shrink-0 relative z-30 shadow-md">
        {/* Row 1: exit | title | lives + coins */}
        <div className="flex items-center justify-between px-3 pt-1.5 pb-1">
          <button
            onClick={() => mode === 'free' ? handleQuitToMenu() : setShowSummary(true)}
            className="p-2 bg-orange-600 rounded-full text-white active:scale-90 transition-transform shadow"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-black text-white drop-shadow leading-none">🍽️ Кухня Бауки</h1>
            <span className="text-[9px] font-bold text-orange-200 leading-none mt-0.5">{playerAvatar} {playerName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {mode !== 'free' && (
              <div className="flex gap-0.5">
                {Array.from({ length: maxLives }).map((_, i) => (
                  <span key={i} className={cn("text-sm leading-none", i < lives ? '' : 'grayscale opacity-30')}>❤️</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 bg-orange-600 px-2.5 py-1.5 rounded-full font-black text-amber-200 text-sm shadow">
              <Coins className="w-3.5 h-3.5" /><span>{coins}</span>
            </div>
          </div>
        </div>

        {/* Row 2: status badges | secondary buttons */}
        <div className="flex items-center px-3 pb-1.5 gap-1.5">
          {speedBoostEnd && (
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
              className="flex items-center gap-1 bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 text-[10px] font-black shadow border border-yellow-300">
              <Zap className="w-2.5 h-2.5" /> {speedBoostSecsLeft}с
            </motion.div>
          )}
          {combo >= 3 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}
              className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black shadow border",
                combo >= 5 ? 'bg-purple-500 border-purple-300 text-white' : 'bg-rose-500 border-rose-300 text-white')}>
              {combo >= 5 ? '⚡' : '🔥'} ×{comboMultiplier} × {combo}
            </motion.div>
          )}
          {mode === 'guests' && (
            <div className="flex items-center gap-1.5 bg-blue-500 text-white rounded-full px-2 py-0.5 text-[10px] font-black shadow">
              🌊 В{wave}
              <div className="flex gap-0.5">
                {Array.from({ length: WAVE_GOAL }).map((_, i) => (
                  <div key={i} className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    i < waveDishes ? 'bg-white' : 'bg-blue-300/50'
                  )} />
                ))}
              </div>
              <span className="tabular-nums">{waveDishes}/{WAVE_GOAL}</span>
            </div>
          )}
          {mode === 'bauka' && (
            <div className="flex items-center gap-1 bg-rose-500 text-white rounded-full px-2 py-0.5 text-[10px] font-black shadow">
              🐻 {baukaServed}/{BAUKA_TARGET}
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setShopOpen(true)} title="Магазин"
              className="p-2.5 bg-amber-400 text-white rounded-full shadow active:scale-95 flex items-center justify-center"
              style={{ minWidth: 40, minHeight: 40 }}>
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button onClick={() => setIsBookOpen(true)} title="100 блюд"
              className="p-2.5 bg-amber-400 text-white rounded-full shadow active:scale-95 flex items-center justify-center"
              style={{ minWidth: 40, minHeight: 40 }}>
              <BookOpen className="w-4 h-4" />
            </button>
            <button onClick={() => setInstructionOpen(true)} title="Как играть"
              className="p-2.5 bg-amber-400 text-white rounded-full shadow active:scale-95 flex items-center justify-center"
              style={{ minWidth: 40, minHeight: 40 }}>
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Recipe hint (top-right) ── */}
      {activeRecipe && tutorialStep === 0 && (
        <div className="absolute top-20 right-1 w-44 z-40 pointer-events-auto">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border-2 border-orange-300 overflow-hidden">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-orange-100 border-b border-orange-200"
              onClick={() => setHintOpen(v => !v)}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🐻</span>
                <div className="text-left">
                  <div className="text-[8px] font-black text-orange-600 uppercase tracking-wider">Подсказка</div>
                  <div className="text-[10px] font-black text-slate-800 leading-tight truncate max-w-20">
                    {activeRecipe.name} {activeRecipe.icon}
                  </div>
                </div>
              </div>
              {hintOpen ? <ChevronUp className="w-3.5 h-3.5 text-orange-500 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
            </button>
            <AnimatePresence>
              {hintOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
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
                  {activeRecipe.tip && (
                    <div className="mx-3 mb-1.5 bg-amber-50 border border-amber-200 rounded-xl p-2">
                      <p className="text-[9px] font-bold text-amber-800 leading-snug">💡 {activeRecipe.tip}</p>
                    </div>
                  )}
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

      {/* ── Wrong dish notification ── */}
      <AnimatePresence>
        {wrongDishInfo && (
          <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white rounded-2xl px-4 py-2.5 shadow-xl border-4 border-rose-300 text-center pointer-events-none">
            <div className="text-xs font-black">😢 Не то блюдо!</div>
            <div className="text-[10px] font-bold opacity-90">Хотели: <span className="font-black">{wrongDishInfo.expected}</span></div>
            <div className="text-[10px] font-bold opacity-90">Получили: <span className="font-black">{wrongDishInfo.got}</span></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Полноэкранные реакции Бауки (недовольство → чапалак → восторг) ── */}
      {mode === 'bauka' && !baukaFinale && (
        <BaukaOverlay phase={baukaPhase} dialog={baukaDialog} onChapalk={handleChapalk} />
      )}

      {/* ── Combo toast ── */}
      <ComboToast level={comboToast} />

      {/* ── Unlock toasts (достижения / задание дня) ── */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none w-full px-6">
        <AnimatePresence>
          {unlockToasts.map(t => (
            <motion.div key={t.key}
              initial={{ y: 30, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.9 }}
              className="bg-slate-800/95 text-white rounded-2xl px-4 py-2.5 shadow-xl border-2 border-amber-400 flex items-center gap-2.5 max-w-xs">
              <span className="text-2xl">{t.icon}</span>
              <div className="text-left">
                <div className="text-xs font-black leading-tight">{t.title}</div>
                {t.sub && <div className="text-[10px] font-bold opacity-70 leading-tight">{t.sub}</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Wave notification ── */}
      <AnimatePresence>
        {waveNotif && (
          <motion.div initial={{ opacity: 0, scale: 0.7, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }} transition={{ type: 'spring', bounce: 0.5 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white rounded-3xl px-6 py-3 font-black text-xl shadow-2xl text-center pointer-events-none border-4 border-blue-300">
            {waveNotif}
            <div className="text-xs font-bold opacity-80 mt-0.5">Гости стали нетерпеливее!</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Customers area ── */}
      {mode !== 'free' ? (
        <div className="relative flex items-end pb-1.5 pt-1 gap-3 px-4 overflow-x-auto overflow-y-hidden shrink-0 border-b-4 border-rose-300 shadow-inner"
          style={{ height: '8.5rem', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x proximity' }}>
          {/* Задник настоящей кухни: розовая стена, окно с зимой, шторы */}
          <KitchenBackdrop />
          {/* Столешница, у которой стоят гости */}
          <div className="absolute bottom-0 w-full h-6 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 100%)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.4)' }} />
          <AnimatePresence>
            {orders.map(order => order.status === 'done' ? null : (
              <div key={order.id} className="relative z-10 shrink-0" style={{ scrollSnapAlign: 'start' }}>
                <CustomerCard
                  order={order}
                  onServe={() => handleServe(order.id)}
                  canServe={finishedDish !== null && order.status === 'waiting'}
                  isUrgent={order.id === mostUrgentId}
                  baukaPhase={order.characterId === CHARACTER_IDS.BAUKA ? baukaPhase : 'idle'}
                  baukaDialog={order.characterId === CHARACTER_IDS.BAUKA ? baukaDialog : null}
                  onChapalk={order.characterId === CHARACTER_IDS.BAUKA ? handleChapalk : undefined}
                />
              </div>
            ))}
          </AnimatePresence>
          {orders.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/70 text-xs font-black uppercase tracking-wider drop-shadow">
              Ждём гостей…
            </div>
          )}
        </div>
      ) : (
        <div className="bg-orange-50 border-b-2 border-orange-200 shrink-0 px-3 py-2 flex items-center gap-2">
          {freeRecipeId && activeRecipe ? (
            <>
              <span className="text-2xl">{activeRecipe.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-black text-orange-600 uppercase">Практика</div>
                <div className="text-xs font-black text-slate-800 truncate">{activeRecipe.name}</div>
              </div>
              <button onClick={() => { setFreeRecipeId(null); handleResetAll(); }}
                className="text-[10px] font-black text-orange-500 bg-orange-100 border border-orange-300 px-2 py-1 rounded-xl active:scale-90">
                Сменить
              </button>
            </>
          ) : (
            <>
              <span className="text-xl">👨‍🍳</span>
              <p className="flex-1 text-[11px] font-bold text-orange-700">Выбери рецепт для практики</p>
              <button onClick={() => setIsBookOpen(true)}
                className="bg-orange-500 text-white font-black text-[11px] px-3 py-1.5 rounded-xl active:scale-90 shadow">
                📖 Выбрать
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Nav tabs ── */}
      <div className="flex justify-center px-2 py-1.5 bg-orange-50 gap-2 shrink-0 z-20 border-b border-orange-200">
        {(['kitchen', 'storage'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 px-4 rounded-2xl font-black text-sm transition-all border-b-4 active:border-b-0 active:translate-y-0.5 flex items-center justify-center gap-1.5",
              tab === 'kitchen'
                ? activeTab === 'kitchen' ? 'bg-orange-500 text-white border-orange-700 shadow-md' : 'bg-white text-slate-500 border-slate-200'
                : activeTab === 'storage' ? 'bg-blue-500 text-white border-blue-700 shadow-md' : 'bg-white text-slate-500 border-slate-200'
            )}>
            {tab === 'kitchen' ? <><Utensils className="w-4 h-4" /> Кухня</> : <>❄️ Склад</>}
          </button>
        ))}
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-10">
        {activeTab === 'kitchen' ? (
          <KitchenView
            plate={plate} prepItems={prepItems} finishedDish={finishedDish}
            onClearPlate={handleClearPlate} onProcessItem={handleProcessItem}
            onStoveRelease={handleStoveRelease} onDiscardItem={handleDiscardItem}
            onAssembleItem={handleAssembleItem}
            onServe={mode === 'free' || waitingOrders.length > 0
              ? () => handleServe(waitingOrders.sort((a, b) => a.timeLeft - b.timeLeft)[0]?.id)
              : undefined}
            plateFlash={plateFlash} activeRecipe={activeRecipe ?? null}
            onQuickPick={handleTakeIngredient} stock={stock}
          />
        ) : (
          <StorageView stock={stock} onTake={handleTakeIngredient} />
        )}
      </div>
    </div>
  );
}
