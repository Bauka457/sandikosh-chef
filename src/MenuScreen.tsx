import { motion } from 'motion/react';
import { useState } from 'react';
import { Profile } from './profile';
import { GameMode } from './App';

interface Props {
  profile: Profile;
  onStart: (mode: GameMode) => void;
  onEditProfile: () => void;
}

export function MenuScreen({ profile, onStart, onEditProfile }: Props) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('guests');

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-orange-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      <div className="z-10 flex flex-col items-center max-w-sm w-full px-6 gap-5">
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.8, y: -50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.6 }}
          className="text-center"
        >
          <div className="text-8xl drop-shadow-2xl mb-2 flex justify-center gap-2">
            <span className="animate-bounce">🐻</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🍔</span>
          </div>
          <h1 className="text-4xl font-black text-amber-900 drop-shadow-sm uppercase tracking-wider">
            Кухня
            <span className="block text-5xl text-orange-500 mt-1">Бауки</span>
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
        </motion.div>
      </div>
    </div>
  );
}
