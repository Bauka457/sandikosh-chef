import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Profile, UPGRADE_DEFS, buyUpgrade, getDailyChallenge, DailyChallenge } from './profile';
import { GameMode } from './App';
import { cn, haptic } from './utils';
import { playSound } from './sound';

interface Props {
  profile: Profile;
  onStart: (mode: GameMode) => void;
  onEditProfile: () => void;
  onProfileUpdate: (p: Profile) => void;
}

const DAILY_LABEL = (d: DailyChallenge) =>
  d.type === 'dishes' ? `Подай ${d.target} блюд`
    : d.type === 'coins' ? `Заработай ${d.target} монет`
    : `Сделай комбо ×${d.target}`;

export function MenuScreen({ profile, onStart, onEditProfile, onProfileUpdate }: Props) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('guests');
  const [upgradesOpen, setUpgradesOpen] = useState(false);
  // Задание дня генерируется при открытии меню (новый день → новое задание)
  const [daily] = useState(() => getDailyChallenge());

  const handleBuy = (id: typeof UPGRADE_DEFS[number]['id']) => {
    const updated = buyUpgrade(id);
    if (!updated) return;
    haptic.success();
    playSound('coin');
    onProfileUpdate(updated);
  };

  return (
    <div className="flex-1 flex flex-col bg-orange-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      {/* Прокручиваемая область: контент центрируется, если влезает, и скроллится, если нет */}
      <div className="relative z-10 flex-1 w-full overflow-y-auto flex flex-col" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="my-auto flex flex-col items-center max-w-sm w-full mx-auto px-6 gap-4 py-5">
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.8, y: -50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.6 }}
          className="text-center"
        >
          <div className="text-6xl drop-shadow-2xl mb-1 flex justify-center gap-2">
            <span className="animate-bounce">🐻</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🍔</span>
          </div>
          <h1 className="text-3xl font-black text-amber-900 drop-shadow-sm uppercase tracking-wide leading-none">
            Кухня
            <span className="block text-4xl text-orange-500 mt-1">Бауки</span>
          </h1>
        </motion.div>

        {/* Profile card */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          onClick={onEditProfile}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-white rounded-2xl px-4 py-3 shadow-md border-2 border-orange-100 flex items-center gap-3 active:border-orange-400 transition-colors"
        >
          <div className="text-4xl">{profile.avatar}</div>
          <div className="flex-1 text-left">
            <div className="text-base font-black text-slate-800">{profile.name}</div>
            <div className="text-[10px] font-bold text-slate-400">
              💰 {profile.totalCoins} монет · 🍽️ {profile.dishesServed} блюд
            </div>
          </div>
          <div className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
            Профиль ✏️
          </div>
        </motion.button>

        {/* Daily challenge banner */}
        {daily && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-white rounded-2xl px-4 py-2.5 shadow-md border-2 border-purple-100 flex items-center gap-3"
          >
            <div className="text-3xl">📅</div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-black text-purple-500 uppercase tracking-wider">Задание дня</div>
              <div className="text-xs font-black text-slate-800">{DAILY_LABEL(daily)}</div>
              <div className="mt-1 h-1.5 bg-purple-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (daily.current / daily.target) * 100)}%` }} />
              </div>
            </div>
            <div className={cn(
              "text-[10px] font-black px-2 py-1 rounded-full border shrink-0",
              daily.completed
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-purple-50 text-purple-600 border-purple-200'
            )}>
              {daily.completed ? '✅ Готово!' : `🏆 +${daily.reward}`}
            </div>
          </motion.div>
        )}

        {/* Mode selector + play */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full bg-white rounded-3xl p-5 shadow-xl border-4 border-orange-100 flex flex-col gap-3"
        >
          <label className="text-xs font-bold text-slate-500 uppercase">Режим Игры</label>
          <div className="grid grid-cols-1 gap-2">
            {([
              { mode: 'guests' as GameMode, icon: '🍽️', label: 'Гости (Заказы)' },
              { mode: 'bauka' as GameMode, icon: '🐻', label: 'Только для Бауки' },
              { mode: 'free' as GameMode, icon: '👨‍🍳', label: 'Свободная Готовка' },
            ]).map(item => (
              <button
                key={item.mode}
                onClick={() => setSelectedMode(item.mode)}
                className={`p-3 rounded-xl border-2 font-bold text-sm text-left flex items-center gap-3 transition-colors ${
                  selectedMode === item.mode
                    ? 'border-orange-500 bg-orange-50 text-orange-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="text-2xl">{item.icon}</span> {item.label}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStart(selectedMode)}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white rounded-xl p-4 font-black text-xl shadow-lg mt-1 uppercase tracking-wide"
          >
            ИГРАТЬ!
          </motion.button>

          <button
            onClick={() => setUpgradesOpen(true)}
            className="w-full bg-amber-50 border-2 border-amber-300 text-amber-800 rounded-xl p-3 font-black text-sm shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <span className="whitespace-nowrap">🔧 Прокачать кухню</span>
            <span className="bg-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded-full shrink-0">💰 {profile.totalCoins}</span>
          </button>
        </motion.div>
      </div>
      </div>

      {/* ── Upgrades modal ── */}
      <AnimatePresence>
        {upgradesOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 flex items-end justify-center backdrop-blur-sm"
            onClick={() => setUpgradesOpen(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="bg-white w-full max-w-sm rounded-t-3xl border-t-4 border-amber-400 shadow-2xl p-5 pb-8 max-h-[80%] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">🔧 Прокачка кухни</h3>
                  <p className="text-xs font-bold text-slate-400">Апгрейды действуют во всех играх</p>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-full font-black text-amber-700 border-2 border-amber-300 text-sm">
                  💰 {profile.totalCoins}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {UPGRADE_DEFS.map(def => {
                  const level = profile.upgrades[def.id];
                  const maxed = level >= def.costs.length;
                  const cost = maxed ? null : def.costs[level];
                  const affordable = cost !== null && profile.totalCoins >= cost;
                  return (
                    <div key={def.id} className={cn(
                      "flex items-center gap-3 border-2 rounded-2xl p-3",
                      maxed ? 'bg-emerald-50 border-emerald-300'
                        : affordable ? 'bg-amber-50 border-amber-400' : 'bg-slate-50 border-slate-200 opacity-70'
                    )}>
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow border border-amber-100">
                        {def.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-800 text-sm">{def.name}</div>
                        <div className="text-[10px] font-bold text-slate-500 leading-tight">{def.description}</div>
                        <div className="flex gap-1 mt-1">
                          {def.costs.map((_, i) => (
                            <div key={i} className={cn(
                              "w-3 h-1.5 rounded-full",
                              i < level ? 'bg-emerald-500' : 'bg-slate-200'
                            )} />
                          ))}
                        </div>
                      </div>
                      <button
                        disabled={maxed || !affordable}
                        onClick={() => cost !== null && handleBuy(def.id)}
                        className={cn(
                          "shrink-0 font-black text-xs px-3 py-2 rounded-full shadow active:scale-95 border-2",
                          maxed ? 'bg-emerald-500 text-white border-emerald-300'
                            : affordable ? 'bg-amber-400 text-amber-900 border-amber-300'
                            : 'bg-slate-200 text-slate-400 border-slate-100'
                        )}
                      >
                        {maxed ? 'МАКС ✓' : `${cost} 💰`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
