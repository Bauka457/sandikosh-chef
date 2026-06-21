import { INGREDIENTS, STORAGE_CABINETS, type StorageCabinet } from '../data';
import { IngredientType } from '../types';
import { cn } from '../utils';
import { motion } from 'motion/react';

interface Props {
  stock: Record<IngredientType, number>;
  onTake: (id: IngredientType) => void;
}

// Визуальная тема для каждого вида шкафа: фон корпуса, цвет полок, акцент.
const THEME: Record<StorageCabinet['kind'], {
  body: string;        // фон корпуса шкафа
  shelf: string;       // фон одной полки
  header: string;      // фон вывески
  headerText: string;
  border: string;
  slot: string;        // фон ячейки под продукт
  tag: string;         // подпись названия
}> = {
  fridge: {
    body: 'linear-gradient(160deg,#e0f2fe 0%,#bae6fd 55%,#7dd3fc 100%)',
    shelf: 'linear-gradient(180deg,rgba(255,255,255,0.85),rgba(224,242,254,0.6))',
    header: 'linear-gradient(180deg,#0ea5e9,#0284c7)', headerText: '#fff',
    border: '#0284c7', slot: 'rgba(255,255,255,0.9)', tag: 'text-sky-700',
  },
  freezer: {
    body: 'linear-gradient(160deg,#eff6ff 0%,#dbeafe 45%,#bfdbfe 100%)',
    shelf: 'linear-gradient(180deg,rgba(255,255,255,0.92),rgba(219,234,254,0.7))',
    header: 'linear-gradient(180deg,#6366f1,#4f46e5)', headerText: '#fff',
    border: '#4f46e5', slot: 'rgba(255,255,255,0.95)', tag: 'text-indigo-700',
  },
  crate: {
    body: 'linear-gradient(160deg,#fde68a 0%,#d6a04f 60%,#b97f36 100%)',
    shelf: 'linear-gradient(180deg,#a16207,#854d0e)',
    header: 'linear-gradient(180deg,#65a30d,#4d7c0f)', headerText: '#fff',
    border: '#854d0e', slot: 'rgba(255,251,235,0.92)', tag: 'text-lime-800',
  },
  pantry: {
    body: 'linear-gradient(160deg,#e7d3b3 0%,#c8a878 60%,#a07d4f 100%)',
    shelf: 'linear-gradient(180deg,#8b5e34,#6b4423)',
    header: 'linear-gradient(180deg,#92400e,#78350f)', headerText: '#fde68a',
    border: '#6b4423', slot: 'rgba(255,251,235,0.92)', tag: 'text-amber-900',
  },
  bakery: {
    body: 'linear-gradient(160deg,#fef3c7 0%,#fcd34d 60%,#f59e0b 100%)',
    shelf: 'linear-gradient(180deg,rgba(255,255,255,0.7),rgba(254,243,199,0.6))',
    header: 'linear-gradient(180deg,#d97706,#b45309)', headerText: '#fff',
    border: '#b45309', slot: 'rgba(255,255,255,0.9)', tag: 'text-amber-800',
  },
  sweets: {
    body: 'linear-gradient(160deg,#fce7f3 0%,#f9a8d4 60%,#ec4899 100%)',
    shelf: 'linear-gradient(180deg,rgba(255,255,255,0.8),rgba(252,231,243,0.6))',
    header: 'linear-gradient(180deg,#db2777,#be185d)', headerText: '#fff',
    border: '#be185d', slot: 'rgba(255,255,255,0.92)', tag: 'text-pink-700',
  },
};

export function StorageView({ stock, onTake }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3"
      style={{ background: 'linear-gradient(180deg,#f5e9d3,#e7d3b3)' }}>
      {STORAGE_CABINETS.map(cab => renderCabinet(cab, stock, onTake))}
      <div className="h-1" />
    </div>
  );
}

function renderCabinet(cab: StorageCabinet, stock: Props['stock'], onTake: Props['onTake']) {
  const t = THEME[cab.kind];
  const items = cab.items.map(id => INGREDIENTS[id]).filter(Boolean);

  return (
    <div key={cab.id} className="rounded-2xl shadow-lg overflow-hidden border-4"
      style={{ borderColor: t.border, background: t.body }}>
      {/* Вывеска шкафа */}
      <div className="flex items-center gap-2 px-3 py-1.5 relative"
        style={{ background: t.header }}>
        <span className="text-lg drop-shadow">{cab.emoji}</span>
        <span className="text-xs font-black uppercase tracking-wide drop-shadow"
          style={{ color: t.headerText }}>{cab.name}</span>
        {/* ручка дверцы холодильника/морозилки */}
        {(cab.kind === 'fridge' || cab.kind === 'freezer') && (
          <span className="ml-auto w-1.5 h-6 rounded-full bg-white/70 shadow-inner" />
        )}
      </div>

      {/* Декор корпуса: иней у морозилки, доски у деревянных */}
      <div className="relative p-2">
        {cab.kind === 'freezer' && (
          <div className="absolute inset-0 pointer-events-none opacity-40"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 10%,#fff 0,transparent 14%),radial-gradient(circle at 80% 30%,#fff 0,transparent 12%),radial-gradient(circle at 50% 80%,#fff 0,transparent 16%)' }} />
        )}

        {/* Полки: продукты на ячейках, по 3 в ряд */}
        <div className="grid grid-cols-3 gap-1.5 relative">
          {items.map(ing => {
            const currentStock = stock[ing.id] ?? 0;
            const isEmpty = currentStock === 0;
            const isLow = !isEmpty && currentStock / ing.maxStock < 0.3;
            return (
              <motion.button
                key={ing.id}
                whileTap={{ scale: 0.9 }}
                disabled={isEmpty}
                onClick={() => onTake(ing.id)}
                className="relative flex flex-col items-center rounded-xl px-1 py-1.5 border-2 transition-all disabled:opacity-50"
                style={{
                  background: t.slot,
                  borderColor: isEmpty ? '#fb7185' : isLow ? '#fb923c' : 'rgba(0,0,0,0.08)',
                }}
              >
                {/* стеклянная полка под продуктом */}
                <span className="absolute -bottom-[3px] left-1 right-1 h-1 rounded-full"
                  style={{ background: t.shelf, opacity: 0.5 }} />
                <span className={cn("text-3xl leading-none", isEmpty && 'grayscale opacity-60')}>
                  {ing.icon}
                </span>
                <span className={cn("mt-0.5 text-[8px] font-black leading-tight text-center truncate w-full", t.tag)}>
                  {ing.name}
                </span>
                {/* бейдж количества */}
                <span className={cn(
                  "absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center shadow border border-white",
                  isEmpty ? 'bg-rose-500 text-white' : isLow ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
                )}>
                  {currentStock}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
