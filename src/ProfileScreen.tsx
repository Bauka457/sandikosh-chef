import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Profile, AVATARS, saveProfile, DEFAULT_PROFILE, ACHIEVEMENTS } from './profile';
import { cn } from './utils';

interface Props {
  profile: Profile;
  onSave: (p: Profile) => void;
  onBack: () => void;
  isSetup?: boolean; // true = first-time setup, no back button
}

export function ProfileScreen({ profile, onSave, onBack, isSetup }: Props) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    const updated: Profile = { ...profile, name: name.trim(), avatar };
    saveProfile(updated);
    onSave(updated);
  };

  const handleReset = () => {
    const fresh: Profile = { ...DEFAULT_PROFILE, name: profile.name, avatar: profile.avatar };
    saveProfile(fresh);
    onSave(fresh);
    setConfirmReset(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-amber-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-orange-500 border-b-4 border-orange-600 shrink-0 shadow-md">
        {!isSetup && (
          <button onClick={onBack} className="p-2 bg-orange-600 rounded-full text-white active:scale-90">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <h1 className="text-base font-black text-white drop-shadow flex-1">
          {isSetup ? '👋 Добро пожаловать!' : '👤 Мой профиль'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* Preview card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-5 shadow-md border-2 border-amber-200 flex flex-col items-center gap-2"
        >
          <div className="text-7xl drop-shadow-md">{avatar}</div>
          <div className="text-xl font-black text-slate-800">{name || 'Твоё имя'}</div>
          {isSetup && (
            <p className="text-xs font-bold text-slate-400 text-center">
              Выбери аватар и введи имя — оно будет везде
            </p>
          )}
        </motion.div>

        {/* Name input */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-amber-100">
          <label className="text-[10px] font-black text-amber-700 uppercase tracking-wider block mb-2">
            Имя шефа
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value.slice(0, 12))}
            placeholder="Введи имя..."
            className="w-full px-4 py-3 bg-amber-50 rounded-xl font-black text-slate-800 text-base outline-none focus:ring-2 focus:ring-orange-400 border border-amber-200"
          />
          <p className="text-[9px] text-slate-400 font-bold mt-1 text-right">{name.length}/12</p>
        </div>

        {/* Avatar grid */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-amber-100">
          <label className="text-[10px] font-black text-amber-700 uppercase tracking-wider block mb-3">
            Аватар
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map(em => (
              <motion.button
                key={em}
                onClick={() => setAvatar(em)}
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "h-12 w-full rounded-xl text-2xl flex items-center justify-center border-3 transition-all",
                  avatar === em
                    ? 'bg-orange-500 border-orange-300 shadow-md scale-110'
                    : 'bg-amber-50 border-amber-100 hover:border-orange-300'
                )}
              >
                {em}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats (only if not setup) */}
        {!isSetup && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-amber-100">
            <div className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-3">Статистика</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '💰', label: 'Монет', value: profile.totalCoins },
                { icon: '🍽️', label: 'Блюд', value: profile.dishesServed },
                { icon: '🎮', label: 'Игр', value: profile.gamesPlayed },
              ].map(stat => (
                <div key={stat.label} className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                  <div className="text-2xl">{stat.icon}</div>
                  <div className="text-lg font-black text-slate-800">{stat.value}</div>
                  <div className="text-[9px] font-bold text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements (only if not setup) */}
        {!isSetup && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-amber-100">
            <div className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-3">
              Достижения · {Object.keys(profile.achievements ?? {}).length}/{ACHIEVEMENTS.length}
            </div>
            <div className="flex flex-col gap-2">
              {ACHIEVEMENTS.map(a => {
                const unlocked = !!profile.achievements?.[a.id];
                return (
                  <div key={a.id} className={cn(
                    "flex items-center gap-3 rounded-xl p-2.5 border",
                    unlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 opacity-60'
                  )}>
                    <div className={cn("text-2xl", !unlocked && 'grayscale')}>{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-800">{a.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 leading-tight">{a.description}</div>
                    </div>
                    {unlocked && <div className="text-emerald-500 font-black text-sm shrink-0">✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset progress (only if not setup) */}
        {!isSetup && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-rose-100">
            <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider mb-2">Опасная зона</div>
            {confirmReset ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-slate-600">Сбросить всю статистику? Имя и аватар останутся.</p>
                <div className="flex gap-2">
                  <button onClick={handleReset}
                    className="flex-1 py-2 bg-rose-500 text-white font-black rounded-xl text-sm active:scale-95">
                    Да, сбросить
                  </button>
                  <button onClick={() => setConfirmReset(false)}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 font-black rounded-xl text-sm active:scale-95">
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2 bg-rose-50 text-rose-500 font-bold rounded-xl text-sm border border-rose-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Сбросить статистику
              </button>
            )}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="p-4 bg-amber-50 border-t border-amber-200 shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-4 bg-orange-500 text-white font-black text-lg rounded-2xl shadow-lg active:scale-95 border-b-4 border-orange-700 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isSetup ? 'Начать готовить! 🍳' : 'Сохранить'}
        </motion.button>
      </div>
    </div>
  );
}
