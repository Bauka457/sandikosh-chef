import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export function MenuScreen({ onStart }: { onStart: (name: string, mode: import('./App').GameMode) => void }) {
  const [name, setName] = useState('');
  const [selectedMode, setSelectedMode] = useState<import('./App').GameMode>('guests');

  // We are removing the add character form to simplify the menu and fit game modes
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-orange-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
      
      <div className="z-10 flex flex-col items-center max-w-sm w-full px-6">
        {/* Logo/Title */}
        <motion.div 
          initial={{ scale: 0.8, y: -50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className="relative mb-8 text-center"
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

        {/* Form panel */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-white rounded-3xl p-6 shadow-xl border-4 border-orange-100 flex flex-col gap-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">ИМЯ (до 10 симв.)</label>
            <div className="flex gap-2">
              <input 
                value={name} onChange={e => setName(e.target.value)}
                className="flex-1 p-3 bg-slate-100 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400" 
                maxLength={10} placeholder="Ваше Имя..."
              />
              <button 
                onClick={() => setName('Баука')} 
                className="px-3 bg-orange-100 text-orange-700 rounded-xl text-xs font-bold active:bg-orange-200"
              >
                 Баука
              </button>
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Режим Игры</label>
             <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setSelectedMode('guests')}
                  className={`p-3 rounded-xl border-2 font-bold text-sm text-left flex items-center gap-3 transition-colors ${selectedMode === 'guests' ? 'border-orange-500 bg-orange-50 text-orange-900' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                  <span className="text-2xl">🍽️</span> Гости (Заказы)
                </button>
                <button 
                  onClick={() => setSelectedMode('bauka')}
                  className={`p-3 rounded-xl border-2 font-bold text-sm text-left flex items-center gap-3 transition-colors ${selectedMode === 'bauka' ? 'border-orange-500 bg-orange-50 text-orange-900' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                  <span className="text-2xl">🐻</span> Только для Бауки
                </button>
                <button 
                  onClick={() => setSelectedMode('free')}
                  className={`p-3 rounded-xl border-2 font-bold text-sm text-left flex items-center gap-3 transition-colors ${selectedMode === 'free' ? 'border-orange-500 bg-orange-50 text-orange-900' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                  <span className="text-2xl">👨‍🍳</span> Свободная Готовка
                </button>
             </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStart(name, selectedMode)}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white rounded-xl p-4 font-black text-xl shadow-lg mt-2 uppercase tracking-wide"
          >
            ИГРАТЬ!
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
