import { motion } from 'motion/react';
import { cn } from '../utils';

/** Поворотная ручка ВКЛ/ВЫКЛ как на настоящей плите/духовке. */
export function Knob({ on, onToggle, tone = 'orange' }: {
  on: boolean;
  onToggle: () => void;
  tone?: 'orange' | 'red';
}) {
  const glow = tone === 'red' ? '#ef4444' : '#f97316';
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="relative shrink-0 active:scale-90 transition-transform"
      style={{ width: 30, height: 30, touchAction: 'manipulation' }}
      aria-label={on ? 'Выключить' : 'Включить'}
    >
      {/* основание ручки */}
      <div className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #6b7280, #1f2937)',
          boxShadow: on ? `0 0 8px 2px ${glow}` : 'inset 0 -2px 3px rgba(0,0,0,0.5)',
        }} />
      {/* указатель */}
      <motion.div
        className="absolute left-1/2 top-1/2 origin-bottom rounded-full"
        style={{ width: 3, height: 11, marginLeft: -1.5, marginTop: -11, background: on ? glow : '#cbd5e1' }}
        animate={{ rotate: on ? 35 : -35 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      />
      {/* индикатор-точка */}
      <div className="absolute rounded-full"
        style={{
          width: 5, height: 5, right: -1, top: 12,
          background: on ? glow : '#475569',
          boxShadow: on ? `0 0 5px ${glow}` : 'none',
        }} />
      <span className={cn(
        "absolute -bottom-3 left-1/2 -translate-x-1/2 text-[7px] font-black tracking-wide",
        on ? 'text-rose-600' : 'text-slate-400'
      )}>
        {on ? 'ВКЛ' : 'ВЫКЛ'}
      </span>
    </button>
  );
}

/** Языки пламени горелки — играют, пока конфорка/духовка включена. */
export function Flames({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-0.5 pointer-events-none z-0">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: 7,
            background: 'linear-gradient(180deg, #fde047 0%, #fb923c 45%, #ef4444 100%)',
            filter: 'blur(0.5px)',
          }}
          animate={{ height: [10, 18 + (i % 3) * 4, 11], opacity: [0.85, 1, 0.85] }}
          transition={{ repeat: Infinity, duration: 0.45 + (i % 3) * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
