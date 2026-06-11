export interface Upgrades {
  fasterKnife: number;  // 0–3: +20%/уровень к скорости нарезки и взбивания
  heatControl: number;  // 0–2: шире окно «снять вовремя» на плите
  extraLife: number;    // 0–1: старт с 4 жизнями
  patience: number;     // 0–2: +10 сек/уровень к таймеру гостей
}

export type UpgradeId = keyof Upgrades;

export interface UpgradeDef {
  id: UpgradeId;
  icon: string;
  name: string;
  description: string;
  costs: number[]; // цена каждого уровня; length = maxLevel
}

export const UPGRADE_DEFS: UpgradeDef[] = [
  { id: 'fasterKnife', icon: '🔪', name: 'Острее нож', description: '+20% к скорости нарезки и взбивания', costs: [50, 100, 200] },
  { id: 'heatControl', icon: '🌡️', name: 'Контроль жара', description: 'Шире окно «снять вовремя» на плите', costs: [80, 160] },
  { id: 'extraLife', icon: '❤️', name: 'Доп. жизнь', description: 'Начинай игру с 4 жизнями', costs: [150] },
  { id: 'patience', icon: '⏱️', name: 'Терпеливые гости', description: '+10 сек к таймеру каждого гостя', costs: [120, 240] },
];

export const DEFAULT_UPGRADES: Upgrades = {
  fasterKnife: 0, heatControl: 0, extraLife: 0, patience: 0,
};

export interface AchievementDef {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_dish', icon: '🍽️', name: 'Первое блюдо', description: 'Подай первое блюдо' },
  { id: 'combo_5', icon: '🔥', name: 'Огонь!', description: 'Сделай комбо ×5' },
  { id: 'wave_5', icon: '🌊', name: 'Прибой', description: 'Доберись до волны 5' },
  { id: 'bauka_fan', icon: '🐻', name: 'Фан Бауки', description: 'Накорми Бауку серией из 5 блюд' },
  { id: 'coins_500', icon: '💰', name: 'Богач', description: 'Заработай 500 монет за сессию' },
  { id: 'speed_cook', icon: '⚡', name: 'Молния', description: 'Подай блюдо, пока осталось больше 80% времени' },
  { id: 'chef_10', icon: '👨‍🍳', name: 'Шеф-повар', description: 'Приготовь 10 разных блюд за сессию' },
];

export type DailyChallengeType = 'dishes' | 'coins' | 'combo';

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  type: DailyChallengeType;
  target: number;
  current: number;
  reward: number; // бонусные монеты
  completed: boolean;
}

export interface Profile {
  name: string;
  avatar: string; // emoji
  totalCoins: number;
  dishesServed: number;
  gamesPlayed: number;
  upgrades: Upgrades;
  achievements: Record<string, string>; // id → ISO-дата разблокировки
  dailyChallenge?: DailyChallenge;
}

const KEY = 'bauka_chef_profile';

export const AVATARS = [
  '👨‍🍳','👩‍🍳','🐻','😸','🦊','🐼','🐸','🦁','🐯','🐺',
  '🤖','👽','🧑‍🚀','🦄','🐉','🎃','🤠','😎','🦸','🧙',
  '🐨','🐮','🐷','🐙','🦅','🐬','🦊','🐝','🍕','🌟',
];

export const DEFAULT_PROFILE: Profile = {
  name: '',
  avatar: '👨‍🍳',
  totalCoins: 0,
  dishesServed: 0,
  gamesPlayed: 0,
  upgrades: { ...DEFAULT_UPGRADES },
  achievements: {},
};

export const loadProfile = (): Profile | null => {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    const p = JSON.parse(s) as Partial<Profile>;
    if (!p.name) return null;
    // Миграция старых профилей: дозаполняем новые поля
    return {
      ...DEFAULT_PROFILE,
      ...p,
      name: p.name,
      upgrades: { ...DEFAULT_UPGRADES, ...(p.upgrades ?? {}) },
      achievements: p.achievements ?? {},
    };
  } catch { return null; }
};

export const saveProfile = (p: Profile): void => {
  localStorage.setItem(KEY, JSON.stringify(p));
};

export const addSessionStats = (coins: number, dishes: number): void => {
  const p = loadProfile();
  if (!p) return;
  saveProfile({
    ...p,
    totalCoins: p.totalCoins + coins,
    dishesServed: p.dishesServed + dishes,
    gamesPlayed: p.gamesPlayed + 1,
  });
};

// ── Апгрейды ──

export const buyUpgrade = (id: UpgradeId): Profile | null => {
  const p = loadProfile();
  if (!p) return null;
  const def = UPGRADE_DEFS.find(d => d.id === id);
  if (!def) return null;
  const level = p.upgrades[id];
  if (level >= def.costs.length) return null; // максимум
  const cost = def.costs[level];
  if (p.totalCoins < cost) return null;
  const updated: Profile = {
    ...p,
    totalCoins: p.totalCoins - cost,
    upgrades: { ...p.upgrades, [id]: level + 1 },
  };
  saveProfile(updated);
  return updated;
};

// ── Достижения ──

/** Возвращает true, если достижение разблокировано только что. */
export const unlockAchievement = (id: string): boolean => {
  const p = loadProfile();
  if (!p || p.achievements[id]) return false;
  saveProfile({
    ...p,
    achievements: { ...p.achievements, [id]: new Date().toISOString() },
  });
  return true;
};

// ── Ежедневный вызов ──

const todayStr = () => new Date().toISOString().slice(0, 10);

const DAILY_DEFS: Record<DailyChallengeType, { target: number; reward: number }> = {
  dishes: { target: 6, reward: 40 },
  coins: { target: 150, reward: 50 },
  combo: { target: 4, reward: 60 },
};

/** Задание дня: возвращает текущее или генерирует новое, если день сменился. */
export const getDailyChallenge = (): DailyChallenge | null => {
  const p = loadProfile();
  if (!p) return null;
  const today = todayStr();
  if (p.dailyChallenge?.date === today) return p.dailyChallenge;
  const types: DailyChallengeType[] = ['dishes', 'coins', 'combo'];
  const type = types[new Date().getDate() % types.length];
  const challenge: DailyChallenge = {
    date: today, type, current: 0, completed: false, ...DAILY_DEFS[type],
  };
  saveProfile({ ...p, dailyChallenge: challenge });
  return challenge;
};

/**
 * Продвигает задание дня: dishes/coins накапливаются, combo — берётся максимум.
 * При выполнении начисляет награду в totalCoins.
 */
export const updateDailyProgress = (
  type: DailyChallengeType, value: number,
): { challenge: DailyChallenge; justCompleted: boolean } | null => {
  const challenge = getDailyChallenge();
  const p = loadProfile();
  if (!challenge || !p || challenge.type !== type || challenge.completed) return null;
  const current = type === 'combo'
    ? Math.max(challenge.current, value)
    : challenge.current + value;
  const completed = current >= challenge.target;
  const updated: DailyChallenge = { ...challenge, current: Math.min(current, challenge.target), completed };
  saveProfile({
    ...p,
    dailyChallenge: updated,
    totalCoins: p.totalCoins + (completed ? challenge.reward : 0),
  });
  return { challenge: updated, justCompleted: completed };
};
