import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../utils';

interface Props { onClose: () => void; }

const STEPS = [
  {
    emoji: '🐻',
    title: 'Знакомство с кухней',
    color: 'from-orange-400 to-amber-500',
    border: 'border-orange-300',
    body: [
      { icon: '📋', text: 'Слева вверху — имя шефа (ты!). Справа — монеты.' },
      { icon: '🐾', text: 'Баука и гости появляются сверху — они дают заказ.' },
      { icon: '🗒️', text: 'В пузыре над гостем написано ЧТО приготовить. Прочитай название.' },
      { icon: '📖', text: 'Нажми книгу 📖 чтобы открыть все 100 рецептов и изучить состав.' },
      { icon: '❓', text: 'Подсказка справа сверху — разверни её: там все шаги текущего заказа.' },
    ],
  },
  {
    emoji: '⚡',
    title: 'Quick Pick — быстрый старт',
    color: 'from-amber-400 to-yellow-500',
    border: 'border-amber-300',
    body: [
      { icon: '⚡', text: 'Под станциями есть полоска с ингредиентами текущего рецепта.' },
      { icon: '👆', text: 'Тапни на ингредиент — он сразу попадёт на нужную станцию.' },
      { icon: '✅', text: 'Зелёная галочка = уже добавлен на тарелку.' },
      { icon: '🔘', text: 'Полупрозрачный = уже в процессе готовки.' },
      { icon: '📦', text: 'Серый = склад пустой — пробуй другой ингредиент или жди.' },
    ],
  },
  {
    emoji: '🔪',
    title: 'Разделочная доска',
    color: 'from-amber-600 to-amber-700',
    border: 'border-amber-500',
    body: [
      { icon: '🥬', text: 'Сюда идут овощи: помидор, лук, огурец, перец, авокадо...' },
      { icon: '👆', text: 'ТАП по овощу = один удар ножом. Нужно несколько ударов.' },
      { icon: '👉', text: 'СВАЙП по овощу = серия ударов подряд (быстрее!).' },
      { icon: '📊', text: 'Следи за полоской прогресса под едой — когда заполнится, готово.' },
      { icon: '✨', text: 'Готовый овощ переходит в колонку «Готово» справа.' },
    ],
  },
  {
    emoji: '🍳',
    title: 'Плита (жарка & варка)',
    color: 'from-orange-500 to-red-400',
    border: 'border-orange-400',
    body: [
      { icon: '🥩', text: 'Сюда идут мясо, курица, рыба, яйца, сосиски, креветки.' },
      { icon: '💧', text: 'Вода, брокколи, горошек, рис, паста — тоже на плиту (варятся).' },
      { icon: '👆', text: 'ТАП по ингредиенту = перемешать/пожарить. Видишь 💨 пар — хорошо!' },
      { icon: '🔥', text: 'Чем чаще тапаешь — тем быстрее готовится. Полоска наполняется.' },
      { icon: '⚡', text: 'Купи «Буст кухни» в магазине 🛍️ — всё готовится в 2× быстрее!' },
    ],
  },
  {
    emoji: '🌡️',
    title: 'Духовка & Миксер',
    color: 'from-red-400 to-rose-500',
    border: 'border-red-300',
    body: [
      { icon: '🥧', text: 'Духовка: корж, тост. Тапай — происходит запекание.' },
      { icon: '🍦', text: 'Миксер: крем. Тапай или свайпай — взбиваешь крем.' },
      { icon: '🌀', text: 'Миксер синий — ингредиент вращается, когда взбиваешь правильно.' },
      { icon: '⏳', text: 'У духовки — пульс: ингредиент чуть увеличивается и уменьшается.' },
      { icon: '✅', text: 'Как и везде — жди заполнения полоски, потом переходит в «Готово».' },
    ],
  },
  {
    emoji: '🍽️',
    title: 'Сборка и подача',
    color: 'from-emerald-400 to-green-500',
    border: 'border-emerald-300',
    body: [
      { icon: '✅', text: 'Когда ингредиент готов — он появляется в левой колонке «Готово».' },
      { icon: '👆', text: 'Тапни на него — он ляжет на тарелку. Зелёный вспыш = правильно!' },
      { icon: '🔴', text: 'Красный вспыш = не тот ингредиент для этого шага. Смотри подсказку.' },
      { icon: '🍽️', text: 'Когда все шаги выполнены — блюдо готово! Нажми «ПОДАТЬ!».' },
      { icon: '🗑️', text: 'Ошибся? Нажми корзину 🗑️ — всё сбросится. Начни заново.' },
    ],
  },
  {
    emoji: '💰',
    title: 'Монеты и магазин',
    color: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-300',
    body: [
      { icon: '💰', text: 'За каждое поданное блюдо получаешь монеты. Быстрее = больше!' },
      { icon: '🛍️', text: 'Кнопка магазина 🛍️ в шапке — там две покупки:' },
      { icon: '⚡', text: '«Буст кухни» за 20 монет — все станции ×2 скорость на 30 секунд.' },
      { icon: '⏳', text: '«Попросить подождать» за 15 монет — самому нетерпеливому +20 сек.' },
      { icon: '🐻', text: 'В режиме Бауки монеты ×2 — она твой самый важный гость!' },
    ],
  },
  {
    emoji: '🐻',
    title: 'Режим Бауки — секреты',
    color: 'from-rose-400 to-pink-500',
    border: 'border-rose-300',
    body: [
      { icon: '🐻', text: 'Баука заказывает разную еду — не только бургеры! Читай пузырь.' },
      { icon: '😒', text: 'Иногда Баука притворяется, что еда невкусная — не верь ей!' },
      { icon: '👋', text: 'Появится кнопка «Дать чапалак» — нажми!' },
      { icon: '😍', text: 'Баука сразу: «А нет нет, это ЛУЧШАЯ еда моей жизни!» 😂' },
      { icon: '💖', text: 'После каждой еды Баука скажет тебе спасибо по имени — уважает!' },
    ],
  },
];

export function InstructionModal({ onClose }: Props) {
  const [page, setPage] = useState(0);
  const step = STEPS[page];

  return (
    <div className="absolute inset-0 z-50 flex flex-col">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative bg-white w-full mt-auto rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: '88%' }}
      >
        {/* Gradient header */}
        <div className={cn("bg-gradient-to-r p-5 pb-4", step.color)}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-4xl drop-shadow">{step.emoji}</div>
            <button onClick={onClose}
              className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center active:scale-90">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <h2 className="text-xl font-black text-white drop-shadow">{step.title}</h2>
          <p className="text-white/80 text-xs font-bold mt-0.5">Шаг {page + 1} из {STEPS.length}</p>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-3">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={cn("h-1.5 rounded-full transition-all", i === page ? 'bg-white w-6' : 'bg-white/40 w-1.5')} />
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-y-auto p-5 space-y-3"
          >
            {step.body.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn("flex items-start gap-3 bg-amber-50 rounded-2xl p-3.5 border-2", step.border)}
              >
                <span className="text-2xl shrink-0 leading-none mt-0.5">{item.icon}</span>
                <p className="text-sm font-bold text-slate-700 leading-snug">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 p-4 border-t border-amber-100 bg-amber-50 shrink-0">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="flex-1 py-3 bg-white border-2 border-amber-200 rounded-2xl font-black text-amber-700 text-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Назад
          </button>
          {page < STEPS.length - 1 ? (
            <button
              onClick={() => setPage(p => p + 1)}
              className={cn("flex-1 py-3 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-1.5 active:scale-95 bg-gradient-to-r", step.color)}
            >
              Далее <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-emerald-500 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-1.5 active:scale-95 border-b-4 border-emerald-700"
            >
              Готов готовить! 🍳
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
