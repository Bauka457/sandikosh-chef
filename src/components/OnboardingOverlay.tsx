import { motion, AnimatePresence } from 'motion/react';

interface Props {
  step: number;
  onNext: () => void;
  onClose: () => void;
}

export function OnboardingOverlay({ step, onNext, onClose }: Props) {
  if (step === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 pointer-events-auto"
          >
            <div className="bg-white rounded-3xl p-6 text-center max-w-sm space-y-4">
              <div className="text-8xl">🐻</div>
              <h2 className="text-2xl font-black text-amber-900">Привет! Я Баука!</h2>
              <p className="text-amber-800 font-medium">
                Я очень люблю есть! Будь моим поваром? Я покажу тебе всё!
              </p>
              <button 
                onClick={onNext}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95"
              >
                Давай!
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.button key="step2" className="absolute inset-0 w-full h-full pointer-events-auto" onClick={onNext}>
             <div className="absolute top-[30%] left-1/2 -translate-x-1/2 text-white text-center w-full px-4 pointer-events-none">
                 <p className="text-xl font-bold bg-black/80 p-4 rounded-2xl inline-block shadow-lg">
                    Это твой ресторан! Сюда приходят клиенты.<br/>
                    Видишь Бауку? Над ним написано его имя!<br/>
                    Тапни на него! (Нажми куда угодно)
                 </p>
                 <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity }} className="text-5xl mt-4">
                     👆
                 </motion.div>
             </div>
          </motion.button>
        )}

        {step === 3 && (
          <motion.div key="step3" className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-auto">
             <div className="bg-white rounded-3xl p-6 text-center max-w-sm space-y-4 shadow-xl">
              <h2 className="text-2xl font-black text-amber-900">Баука хочет бургер!</h2>
              <p className="text-amber-800 font-medium">
                Картинка в пузыре показывает что нужно приготовить. Запомни — это твой заказ!
              </p>
              <button onClick={onNext} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-lg">
                Понял!
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" className="absolute inset-0 pointer-events-none">
             <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 text-white text-center w-full px-4 mb-4 pointer-events-none">
                 <p className="text-xl font-bold bg-black/80 p-4 rounded-2xl inline-block shadow-lg">
                    Все ингредиенты хранятся на складе!<br/>
                    Нажми на иконку Склада внизу!
                 </p>
                 <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity }} className="text-5xl mt-2 rotate-180">
                     👆
                 </motion.div>
             </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" className="absolute inset-0 pointer-events-none">
             <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-white text-center w-full px-4 pointer-events-none">
                 <p className="text-xl font-bold bg-black/80 p-4 rounded-2xl inline-block shadow-lg">
                    Тапни на булочку, котлету и салат чтобы взять их!
                 </p>
             </div>
             <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full font-bold pointer-events-auto">Пропустить обучение</button>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" className="absolute inset-0 pointer-events-none bg-black/40">
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-white text-center w-full px-4 pointer-events-none z-50">
                 <p className="text-lg font-bold bg-black/90 p-4 rounded-2xl inline-block shadow-lg">
                    Всё очень просто!<br/>
                    Нажми (тапни) на котлету на плите много раз, чтобы пожарить её!<br/>
                    Тапай по ингредиентам на станциях, пока не заполнится шкала готовности!<br/>
                    Просто нажимай!
                 </p>
             </div>
             <button onClick={onNext} className="absolute bottom-1/4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-8 py-3 rounded-full font-bold text-xl pointer-events-auto">Дальше</button>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div key="step7" className="absolute inset-0 pointer-events-auto bg-black/40 flex flex-col items-center justify-center p-6 text-center">
             <div className="bg-white rounded-3xl p-6 max-w-sm space-y-4 shadow-xl">
                 <h2 className="text-2xl font-black text-amber-900">Сборка и подача!</h2>
                 <p className="text-amber-800 font-medium text-lg">
                    Перетаскивай готовые ингредиенты на столешницу.
                    Снизу вверх по порядку рецепта: булочка, котлета, салат, булочка!
                 </p>
                 <p className="text-amber-800 font-medium text-lg">
                    Когда соберётся - тапни на Бауку чтобы подать!
                 </p>
                 <button onClick={onClose} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95">
                    Я готов готовить!
                 </button>
             </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
