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
 * Разделочная доска в стиле Cooking Fever: тёплое дерево с волокнами и тенью,
 * крупный ингредиент по центру, стальной нож-SVG с бликом и заклёпками,
 * который рубит вниз-вверх на тап/свайп. Вся сцена — один масштабируемый SVG.
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
    // нож рубит вниз к ингредиенту и возвращается (остаётся в кадре)
    knife.start({ y: [0, 17, 0] }, { duration: 0.22, times: [0, 0.5, 1], ease: 'easeOut' });
    // ингредиент вздрагивает под лезвием
    food.start({ scaleY: [1, 0.86, 1], x: [0, -1.5, 1.5, 0] }, { duration: 0.22 });
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
      style={{
        width: 140,
        aspectRatio: '140 / 100',
        maxWidth: '100%',
        maxHeight: '100%',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { startY.current = null; }}
    >
      <svg
        viewBox="0 0 140 100"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full overflow-visible"
      >
        <defs>
          {/* тёплое дерево */}
          <linearGradient id="kniWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E2BA82" />
            <stop offset="0.5" stopColor="#D4A574" />
            <stop offset="1" stopColor="#C2914F" />
          </linearGradient>
          {/* сталь лезвия */}
          <linearGradient id="kniSteel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbfdff" />
            <stop offset="0.5" stopColor="#cfd8e2" />
            <stop offset="1" stopColor="#aab6c4" />
          </linearGradient>
          {/* дерево рукояти */}
          <linearGradient id="kniHandle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8a5e34" />
            <stop offset="1" stopColor="#5a3c1f" />
          </linearGradient>

          <filter id="kniBoardShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#3a2410" floodOpacity="0.35" />
          </filter>
          <filter id="kniKnifeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.6" stdDeviation="1.1" floodColor="#000000" floodOpacity="0.4" />
          </filter>
          <filter id="kniCutShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.6" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* ── Доска: 3D-торец + столешница ── */}
        <rect x="12" y="20" width="116" height="62" rx="13" fill="#A9762F" />
        <g filter="url(#kniBoardShadow)">
          <rect x="12" y="14" width="116" height="64" rx="13" fill="url(#kniWood)" stroke="#9C6F30" strokeWidth="1.5" />
        </g>
        {/* блик сверху для объёма */}
        <rect x="16" y="17" width="108" height="10" rx="6" fill="#ffffff" opacity="0.12" />
        {/* волокна дерева */}
        <g stroke="#B9874A" strokeWidth="1" fill="none" opacity="0.45" strokeLinecap="round">
          <path d="M22 32 q34 -5 96 0" />
          <path d="M22 42 q40 5 96 -1" />
          <path d="M22 52 q30 -6 96 1" />
          <path d="M22 62 q44 6 96 -1" />
          <path d="M22 71 q34 -4 96 0" />
        </g>
        {/* сучок */}
        <ellipse cx="36" cy="47" rx="3.2" ry="5" fill="none" stroke="#A9762F" strokeWidth="1.4" opacity="0.5" />
        {/* отверстие-ручка справа */}
        <circle cx="119" cy="46" r="2.4" fill="#9C6F30" opacity="0.6" />

        {/* ── Ингредиент + линии разреза ── */}
        <motion.g animate={food} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <text
            x="70"
            y="49"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="42"
            style={{ filter: isRaw ? 'grayscale(1) brightness(0.92)' : undefined }}
          >
            {icon}
          </text>
          <g filter="url(#kniCutShadow)" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.92">
            {Array.from({ length: cuts }).map((_, i) => (
              <line key={i} x1="54" y1="49" x2="86" y2="49" transform={`rotate(${-34 + i * 16} 70 49)`} />
            ))}
          </g>
        </motion.g>

        {/* ── Нож (сталь + рукоять с заклёпками) ── */}
        <motion.g animate={knife} initial={{ y: 0 }} filter="url(#kniKnifeShadow)">
          {/* рукоять */}
          <rect x="62" y="0" width="16" height="13" rx="3.5" fill="url(#kniHandle)" stroke="#46300f" strokeWidth="1" />
          {/* заклёпки */}
          <circle cx="70" cy="3.4" r="1.15" fill="#E4C485" />
          <circle cx="70" cy="6.5" r="1.15" fill="#E4C485" />
          <circle cx="70" cy="9.6" r="1.15" fill="#E4C485" />
          {/* больстер */}
          <rect x="63" y="13" width="14" height="3" rx="1.2" fill="url(#kniSteel)" stroke="#8b95a1" strokeWidth="0.6" />
          {/* лезвие */}
          <path
            d="M63 16 L77 16 L74.5 26 L70 32 L65.5 26 Z"
            fill="url(#kniSteel)"
            stroke="#8b95a1"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* центральный блик */}
          <path d="M69 17 L71 17 L70 30 Z" fill="#ffffff" opacity="0.6" />
          {/* остриё-кромка */}
          <path d="M65.5 26 L70 32 L74.5 26" fill="none" stroke="#eef3f8" strokeWidth="0.9" strokeLinecap="round" />
        </motion.g>

        {/* ── Прогресс-бар ── */}
        <rect x="35" y="87" width="70" height="4.5" rx="2.25" fill="#000000" opacity="0.22" />
        <motion.rect
          x="35"
          y="87"
          height="4.5"
          rx="2.25"
          fill="#10b981"
          animate={{ width: (progress / 100) * 70 }}
          transition={{ duration: 0.18 }}
        />
      </svg>

      {/* ── Подсказка на сыром (HTML-оверлей) ── */}
      {progress === 0 && (
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-700 px-1.5 py-0.5 text-[8px] font-black text-white shadow"
        >
          🔪 Режь!
        </motion.div>
      )}
    </div>
  );
}
