import { motion } from 'motion/react';

/**
 * Декоративный задник «настоящей кухни» в стиле референса:
 * розовые стены, окно с зимним пейзажем и жёлтыми шторами,
 * навесные шкафчики и плитка. Чисто визуальный слой — pointer-events:none.
 */
export function KitchenBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Розовая стена */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #f9a8c4 0%, #f7a0bd 55%, #f48fb1 100%)',
      }} />
      {/* Обои в тонкую полоску */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 16px)',
      }} />

      {/* Навесные шкафчики справа */}
      <div className="absolute top-1 right-2 flex gap-1">
        {[0, 1].map(i => (
          <div key={i} className="w-9 h-7 rounded-md bg-rose-300/80 border border-rose-400/70 shadow-sm relative">
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-100" />
          </div>
        ))}
      </div>

      {/* ── Окно с зимним пейзажем ── */}
      <div className="absolute top-1.5 left-3" style={{ width: 96, height: 78 }}>
        {/* Рама */}
        <div className="absolute inset-0 rounded-lg bg-white shadow-md border-2 border-rose-200" />
        {/* Небо + снег */}
        <div className="absolute rounded-md overflow-hidden"
          style={{ inset: 5, background: 'linear-gradient(180deg, #bfe3f5 0%, #e8f6ff 70%, #ffffff 100%)' }}>
          {/* Снежные холмы */}
          <div className="absolute bottom-0 w-full h-5 bg-white rounded-t-[60%]" />
          <div className="absolute bottom-0 left-6 w-16 h-4 bg-white/90 rounded-t-[70%]" />
          {/* Домик */}
          <div className="absolute bottom-3 left-2 w-5 h-4 bg-rose-200" />
          <div className="absolute bottom-6 left-1.5 w-0 h-0"
            style={{ borderLeft: '13px solid transparent', borderRight: '13px solid transparent', borderBottom: '8px solid #be7a90' }} />
          {/* Ёлочки */}
          <div className="absolute bottom-3 right-3 w-0 h-0"
            style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '12px solid #6aa56a' }} />
          <div className="absolute bottom-3 right-7 w-0 h-0"
            style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '9px solid #7fb37f' }} />
          {/* Падающий снег */}
          {[12, 34, 58, 78, 24, 66].map((x, i) => (
            <motion.div key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{ left: x }}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 70, opacity: [0, 1, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3.5 + (i % 3), delay: i * 0.5, ease: 'linear' }}
            />
          ))}
        </div>
        {/* Крестовина рамы */}
        <div className="absolute top-1.5 bottom-1.5 left-1/2 -translate-x-1/2 w-[3px] bg-white" />
        <div className="absolute left-1.5 right-1.5 top-1/2 -translate-y-1/2 h-[3px] bg-white" />
        {/* Жёлтые шторы */}
        <div className="absolute -top-1 -left-2 w-5 h-[88%] rounded-b-2xl"
          style={{ background: 'linear-gradient(90deg, #fde047, #facc15)' }} />
        <div className="absolute -top-1 -right-2 w-5 h-[88%] rounded-b-2xl"
          style={{ background: 'linear-gradient(270deg, #fde047, #facc15)' }} />
        {/* Ламбрекен */}
        <div className="absolute -top-1 -left-2 -right-2 h-3 rounded-b-md bg-yellow-400" />
      </div>
    </div>
  );
}
