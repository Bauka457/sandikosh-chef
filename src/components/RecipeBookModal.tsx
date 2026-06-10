import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RECIPES, INGREDIENTS } from '../data';
import { Recipe, RecipeCategory } from '../types';
import { cn } from '../utils';
import { X, Search } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  meat: '🥩 Мясо',
  healthy: '🥗 Здоровое',
  sweet: '🍰 Сладости',
  seafood: '🦐 Морепродукты',
  soup: '🥣 Супы',
  fastfood: '🍔 Фастфуд',
  pasta: '🍝 Паста/Рис',
  breakfast: '🍳 Завтрак',
  bakery: '🥐 Выпечка',
  asian: '🍜 Азия',
  russian: '🥟 Русская',
  mexican: '🌮 Мексика',
};

const DONENESS_LABEL: Record<string, string> = {
  'rare': '🩸 С кровью',
  'medium-rare': '🟠 Полупрожаренное',
  'medium': '🟡 Средняя',
  'well-done': '✅ Прожарено',
  'crispy': '🟤 Хрустящее',
  'al-dente': '🍝 Аль денте',
  'golden': '🟨 Золотистое',
  'fully-cooked': '✅ Полностью',
};

const PROCESS_LABELS: Record<string, string> = {
  cook: '🍳 Жарить',
  cut: '🔪 Резать',
  bake: '🌡️ Печь',
  mix: '🌀 Взбить',
  boil: '💧 Варить',
  none: '✋ Взять',
};

const DIFFICULTY_STARS: Record<number, string> = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };

const allCategories: RecipeCategory[] = [
  'fastfood', 'meat', 'soup', 'pasta', 'seafood',
  'healthy', 'breakfast', 'sweet', 'bakery', 'asian', 'russian', 'mexican',
];

export function RecipeBookModal({ onClose }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const allRecipes = Object.values(RECIPES);

  const filtered = allRecipes.filter(r => {
    const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchSearch = search.length === 0 ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.cuisine?.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const total = allRecipes.length;

  return (
    <div className="absolute inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative bg-slate-900 w-full h-[95%] mt-auto rounded-t-3xl flex flex-col border-t-4 border-amber-500/60 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <div>
            <h2 className="text-xl font-black text-white">📖 Меню Блюд</h2>
            <p className="text-xs font-bold text-slate-400">{total} рецептов · {filtered.length} показано</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-700 text-slate-300 font-black text-lg flex items-center justify-center active:scale-90 transition-transform hover:bg-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск блюд..."
              className="flex-1 bg-transparent text-white text-sm font-bold outline-none placeholder:text-slate-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div className="shrink-0 overflow-x-auto pb-2">
          <div className="flex gap-2 px-4" style={{ width: 'max-content' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all active:scale-95",
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              )}
            >
              🍽️ Все ({total})
            </button>
            {allCategories.map(cat => {
              const count = allRecipes.filter(r => r.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all active:scale-95",
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  )}
                >
                  {CATEGORY_LABELS[cat]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 font-bold">Ничего не найдено</div>
          )}
          {filtered.map(recipe => (
            <div key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                expanded={expanded === recipe.id}
                onToggle={() => setExpanded(expanded === recipe.id ? null : recipe.id)}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function RecipeCard({ recipe, expanded, onToggle }: { recipe: Recipe; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.div
      layout
      className={cn(
        "bg-slate-800 rounded-2xl overflow-hidden border-2 transition-colors",
        expanded ? 'border-amber-500/60' : 'border-slate-700'
      )}
    >
      {/* Card header — always visible, tap to expand */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left active:bg-slate-700/50 transition-colors"
      >
        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner">
          {recipe.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm truncate">{recipe.name}</span>
            {recipe.difficulty && (
              <span className="text-[10px] text-yellow-400 shrink-0">{DIFFICULTY_STARS[recipe.difficulty]}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="text-[9px] font-bold text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded-full">
              {CATEGORY_LABELS[recipe.category]}
            </span>
            {recipe.cuisine && (
              <span className="text-[9px] font-bold text-slate-400">{recipe.cuisine}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-black text-amber-400">💰{recipe.price}</span>
          {recipe.servingGrams && (
            <span className="text-[9px] font-bold text-slate-500">{recipe.servingGrams}г</span>
          )}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-700"
          >
            <div className="p-3 space-y-3">
              {/* Meta chips */}
              <div className="flex flex-wrap gap-1.5">
                {recipe.ovenTemp && (
                  <div className="bg-orange-900/60 border border-orange-700/40 rounded-lg px-2 py-1 text-center">
                    <div className="text-[8px] font-bold text-orange-400 uppercase">Духовка</div>
                    <div className="text-[11px] font-black text-orange-200">{recipe.ovenTemp}°C</div>
                  </div>
                )}
                {recipe.cookTimeSec && (
                  <div className="bg-slate-700/60 border border-slate-600/40 rounded-lg px-2 py-1 text-center">
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Время</div>
                    <div className="text-[11px] font-black text-slate-200">
                      {recipe.cookTimeSec >= 60
                        ? `${Math.round(recipe.cookTimeSec / 60)} мин`
                        : `${recipe.cookTimeSec} сек`}
                    </div>
                  </div>
                )}
                {recipe.doneness && (
                  <div className="bg-slate-700/60 border border-slate-600/40 rounded-lg px-2 py-1">
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Готовность</div>
                    <div className="text-[10px] font-black text-slate-200">{DONENESS_LABEL[recipe.doneness]}</div>
                  </div>
                )}
              </div>

              {/* Tip */}
              {recipe.tip && (
                <div className="bg-amber-900/30 border border-amber-700/30 rounded-xl p-2.5">
                  <p className="text-[10px] font-bold text-amber-300 leading-tight">
                    💡 <span className="font-black">Совет шефа:</span> {recipe.tip}
                  </p>
                </div>
              )}

              {/* Steps */}
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Шаги приготовления:</div>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.steps.map((step, idx) => {
                    const ing = INGREDIENTS[step.ingredient];
                    const processLabel = PROCESS_LABELS[ing?.process ?? 'none'];
                    return (
                      <div key={idx} className="flex items-center gap-1.5 bg-slate-700/60 rounded-xl px-2 py-1.5 border border-slate-600/50">
                        <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-lg shrink-0">
                          {ing?.icon ?? '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-amber-300 leading-none">{processLabel}</span>
                          <span className="text-[9px] font-bold text-white leading-tight">{ing?.name ?? step.ingredient}</span>
                          {ing?.grams && (
                            <span className="text-[8px] font-bold text-slate-500 leading-none">{ing.grams}г</span>
                          )}
                        </div>
                        {idx < recipe.steps.length - 1 && (
                          <span className="text-slate-600 text-xs font-black ml-0.5">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
