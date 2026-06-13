import { motion, useAnimationControls } from 'motion/react';
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { cn, haptic } from '../utils';
import { playSound } from '../sound';

interface Props {
  /** Эмодзи нарезаемого ингредиента */
  icon: string;
  /** Прогресс нарезки 0..100 (управляется родителем через onCut) */
  progress: number;
  /** Состояние из PrepItem — нужно только для серого «сырого» вида */
  state?: 'raw' | 'processing' | 'ready' | 'burned';
  /** Вызывается на каждый тап/свайп вниз; amount — сколько прогресса добавить */
  onCut: (amount: number) => void;
  /** Вызывается один раз, когда прогресс достиг 100% */
  onComplete?: () => void;
  className?: string;
}

const MAX_LINES = 5;        // максимум линий разреза на ингредиенте
const TAP_AMOUNT = 20;      // прогресс за тап
const SWIPE_AMOUNT = 32;    // прогресс за свайп вниз (рубить эффективнее)
const SWIPE_THRESHOLD = 14; // px вертикального движения = один рез

/**
 * Реальная разделочная доска: деревянный SVG-фон, нож-SVG, который рубит
 * вниз-вверх на каждый тап/свайп, и линии разреза, нарастающие по прогрессу.
 */
export function KnifeAnimation({ icon, progress, state, onCut, onComplete, className }: Props) {
  const knife = useAnimationControls();
  const food = useAnimationControls();
  const startY = useRef<number | null>(null);
  const swiped = useRef(false);
  const completed = useRef(false);

  // onComplete ровно один раз при достижении 100%
  useEffect(() => {
    if (progress >= 100 && !completed.current) {
      completed.current = true;
      onComplete?.();
    }
    if (progress < 100) completed.current = false;
  }, [progress, onComplete]);

  const chop = (amount: number) => {
    if (progress >= 100) return;
    // удар ножом: вниз к ингредиенту и обратно
    knife.start({
      y: [-30, 6, -30],
      rotate: [-26, -6, -26],
    }, { duration: 0.24, times: [0, 0.5, 1], ease: 'easeInOut' });
    // ингредиент вздрагивает под ножом
    food.start({ x: [0, -2, 2, 0], scaleY: [1, 0.88, 1] }, { duration: 0.24 });
    haptic.light();
    playSound('chop');
    onCut(amount);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    startY.current = e.clientY;
    swiped.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (startY.current === null || e.buttons !== 1) return;
    const dy = e.clientY - startY.current;
    if (dy > SWIPE_THRESHOLD) {        // свайп вниз = рез
      chop(SWIPE_AMOUNT);
      startY.current = e.clientY;       // позволяем серию резов одним движением
      swiped.current = true;
    }
  };
  const handlePointerUp = () => {
    if (!swiped.current) chop(TAP_AMOUNT); // не было свайпа → засчитываем тап
    startY.current = null;
  };

  const cuts = Math.min(MAX_LINES, Math.floor((progress / 100) * MAX_LINES));
  const isRaw = state ? state === 'raw' : progress === 0;

  return (
    <div
      className={cn('relative select-none cursor-pointer', className)}
      style={{ width: 92, height: 78, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { startY.current = null; }}
    >
      {/* ── Деревянная доска (SVG) ── */}
      <svg viewBox="0 0 100 84" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="kniBoard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8c089" />
            <stop offset="1" stopColor="#cf9a4f" />
          </linearGradient>
        </defs>
        {/* ручка-«язычок» доски слева */}
        <rect x="2" y="30" width="14" height="22" rx="5" fill="#c08f49" stroke="#9c6f30" strokeWidth="1.5" />
        {/* тело доски */}
        <rect x="12" y="14" width="86" height="66" rx="11" fill="url(#kniBoard)" stroke="#9c6f30" strokeWidth="2" />
        {/* волокна дерева */}
        {[24, 33, 42, 51, 60, 69].map((y) => (
          <line key={y} x1="20" y1={y} x2="92" y2={y} stroke="#b07f3c" strokeWidth="1" opacity="0.35" />
        ))}
      </svg>

      {/* ── Ингредиент с линиями разреза ── */}
      <motion.div
        animate={food}
        className="absolute left-1/2 top-[54%] z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ originY: 1 }}
      >
        <div className={cn('relative text-3xl leading-none', isRaw && 'grayscale brightness-90')}>
          {icon}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {Array.from({ length: cuts }).map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 h-0.5 w-7 rounded-full bg-white/85 shadow-sm"
                style={{ transform: `translate(-50%,-50%) rotate(${-32 + i * 16}deg)` }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Нож (SVG) ── */}
      <motion.svg
        animate={knife}
        initial={{ y: -30, rotate: -26 }}
        viewBox="0 0 64 64"
        className="absolute left-[56%] top-0 z-20 h-10 w-10 origin-bottom-left drop-shadow-md pointer-events-none"
      >
        {/* лезвие */}
        <path d="M6 6 L44 32 L8 36 Z" fill="#e3e9f0" stroke="#94a0ad" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6 6 L44 32 L24 33 Z" fill="#f4f8fc" opacity="0.85" />
        {/* обух/блик */}
        <line x1="6" y1="6" x2="44" y2="32" stroke="#ffffff" strokeWidth="1.4" opacity="0.7" />
        {/* рукоять */}
        <g transform="rotate(34 42 32)">
          <rect x="42" y="28" width="20" height="8" rx="4" fill="#6b4a2b" stroke="#46300f" strokeWidth="1.2" />
          <circle cx="58" cy="32" r="1.4" fill="#caa86f" />
        </g>
      </motion.svg>

      {/* ── Прогресс-бар ── */}
      <div className="absolute bottom-0 left-1/2 z-20 w-[74%] -translate-x-1/2">
        <div className="h-1.5 overflow-hidden rounded-full bg-amber-900/30">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.18 }}
          />
        </div>
      </div>

      {/* ── Подсказка на сыром ── */}
      {progress === 0 && (
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute -top-1.5 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-700 px-1.5 py-0.5 text-[8px] font-black text-white shadow"
        >
          🔪 Режь!
        </motion.div>
      )}
    </div>
  );
}
