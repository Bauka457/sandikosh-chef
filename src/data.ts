import { Ingredient, Recipe, Character } from './types';

export const INGREDIENTS: Record<string, Ingredient> = {
  // === БУЛКИ & ХЛЕБ ===
  bun_bottom: { id: 'bun_bottom', name: 'Низ булочки', icon: '🍞', maxStock: 6, process: 'none', grams: 50 },
  bun_top: { id: 'bun_top', name: 'Верх булочки', icon: '🥯', maxStock: 6, process: 'none', grams: 50 },
  bread: { id: 'bread', name: 'Хлеб/Лаваш', icon: '🫓', maxStock: 6, process: 'none', grams: 60 },
  toast: { id: 'toast', name: 'Тост', icon: '🍞', maxStock: 6, process: 'bake', processRequired: 50, grams: 40 },

  // === МЯСО ===
  patty: { id: 'patty', name: 'Котлета', icon: '🥩', maxStock: 4, process: 'cook', processRequired: 100, grams: 150 },
  chicken: { id: 'chicken', name: 'Курица', icon: '🍗', maxStock: 4, process: 'cook', processRequired: 100, grams: 200 },
  fish: { id: 'fish', name: 'Рыба', icon: '🐟', maxStock: 4, process: 'cook', processRequired: 80, grams: 200 },
  bacon: { id: 'bacon', name: 'Бекон', icon: '🥓', maxStock: 4, process: 'cook', processRequired: 60, grams: 80 },
  sausage: { id: 'sausage', name: 'Сосиска', icon: '🌭', maxStock: 4, process: 'cook', processRequired: 70, grams: 100 },
  shrimp: { id: 'shrimp', name: 'Креветки', icon: '🦐', maxStock: 4, process: 'cook', processRequired: 50, grams: 150 },
  pork_ribs: { id: 'pork_ribs', name: 'Рёбрышки', icon: '🍖', maxStock: 3, process: 'cook', processRequired: 150, grams: 500 },

  // === ОВОЩИ & ЗЕЛЕНЬ ===
  lettuce: { id: 'lettuce', name: 'Салат лист', icon: '🥬', maxStock: 5, process: 'cut', processRequired: 30, grams: 50 },
  tomato: { id: 'tomato', name: 'Помидор', icon: '🍅', maxStock: 5, process: 'cut', processRequired: 30, grams: 100 },
  onion: { id: 'onion', name: 'Лук', icon: '🧅', maxStock: 5, process: 'cut', processRequired: 40, grams: 80 },
  potato: { id: 'potato', name: 'Картофель', icon: '🥔', maxStock: 5, process: 'cut', processRequired: 50, grams: 200 },
  carrot: { id: 'carrot', name: 'Морковь', icon: '🥕', maxStock: 5, process: 'cut', processRequired: 40, grams: 100 },
  cucumber: { id: 'cucumber', name: 'Огурец', icon: '🥒', maxStock: 5, process: 'cut', processRequired: 20, grams: 100 },
  mushroom: { id: 'mushroom', name: 'Грибы', icon: '🍄', maxStock: 5, process: 'cut', processRequired: 20, grams: 80 },
  garlic: { id: 'garlic', name: 'Чеснок', icon: '🧄', maxStock: 5, process: 'cut', processRequired: 20, grams: 20 },
  bell_pepper: { id: 'bell_pepper', name: 'Перец', icon: '🫑', maxStock: 5, process: 'cut', processRequired: 30, grams: 80 },
  broccoli: { id: 'broccoli', name: 'Брокколи', icon: '🥦', maxStock: 4, process: 'boil', processRequired: 60, grams: 150 },
  avocado: { id: 'avocado', name: 'Авокадо', icon: '🥑', maxStock: 4, process: 'cut', processRequired: 20, grams: 100 },
  peas: { id: 'peas', name: 'Горошек', icon: '🫛', maxStock: 5, process: 'boil', processRequired: 40, grams: 100 },
  apple: { id: 'apple', name: 'Яблоко', icon: '🍎', maxStock: 4, process: 'cut', processRequired: 30, grams: 150 },
  lemon: { id: 'lemon', name: 'Лимон', icon: '🍋', maxStock: 5, process: 'cut', processRequired: 10, grams: 50 },
  herbs: { id: 'herbs', name: 'Зелень', icon: '🌿', maxStock: 5, process: 'none', grams: 10 },

  // === МОЛОЧНОЕ & РАЗНОЕ ===
  cheese: { id: 'cheese', name: 'Сыр', icon: '🧀', maxStock: 5, process: 'none', grams: 50 },
  egg: { id: 'egg', name: 'Яйцо', icon: '🥚', maxStock: 6, process: 'cook', processRequired: 60, grams: 60 },
  butter: { id: 'butter', name: 'Масло', icon: '🧈', maxStock: 6, process: 'none', grams: 30 },
  milk: { id: 'milk', name: 'Молоко', icon: '🥛', maxStock: 4, process: 'none', grams: 200 },
  flour: { id: 'flour', name: 'Мука', icon: '🌾', maxStock: 4, process: 'none', grams: 200 },
  sugar: { id: 'sugar', name: 'Сахар', icon: '🧂', maxStock: 4, process: 'none', grams: 100 },
  soy_sauce: { id: 'soy_sauce', name: 'Соевый соус', icon: '🫙', maxStock: 5, process: 'none', grams: 20 },
  mayo: { id: 'mayo', name: 'Майонез', icon: '🥫', maxStock: 5, process: 'none', grams: 30 },
  coffee: { id: 'coffee', name: 'Кофе', icon: '☕', maxStock: 4, process: 'none', grams: 30 },
  cinnamon: { id: 'cinnamon', name: 'Корица', icon: '🌰', maxStock: 5, process: 'none', grams: 5 },

  // === КРУПЫ & ЖИДКОСТИ ===
  water: { id: 'water', name: 'Вода', icon: '💧', maxStock: 4, process: 'boil', processRequired: 80, grams: 500 },
  pasta: { id: 'pasta', name: 'Паста', icon: '🍝', maxStock: 4, process: 'boil', processRequired: 100, grams: 200 },
  rice: { id: 'rice', name: 'Рис', icon: '🍚', maxStock: 4, process: 'boil', processRequired: 100, grams: 200 },

  // === СЛАДОСТИ ===
  cake_base: { id: 'cake_base', name: 'Корж', icon: '🥧', maxStock: 2, process: 'bake', processRequired: 120, grams: 300 },
  cream: { id: 'cream', name: 'Крем', icon: '🍦', maxStock: 3, process: 'mix', processRequired: 50, grams: 100 },
  berry: { id: 'berry', name: 'Ягоды', icon: '🍓', maxStock: 4, process: 'none', grams: 100 },
  chocolate: { id: 'chocolate', name: 'Шоколад', icon: '🍫', maxStock: 4, process: 'none', grams: 50 },
};

export const RECIPES: Record<string, Recipe> = {
  // =========================================
  // БУРГЕРЫ & СЭНДВИЧИ
  // =========================================
  classic_burger: {
    id: 'classic_burger', name: 'Бургер Классик', icon: '🍔', category: 'fastfood', price: 50,
    servingGrams: 350, difficulty: 1, doneness: 'well-done',
    tip: 'Котлета должна быть прожарена полностью!',
    cuisine: 'Американская',
    steps: [
      { ingredient: 'bun_bottom', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'bun_top', action: 'tap' },
    ]
  },
  cheese_burger: {
    id: 'cheese_burger', name: 'Чизбургер', icon: '🍔', category: 'fastfood', price: 60,
    servingGrams: 300, difficulty: 1, doneness: 'well-done',
    tip: 'Сыр кладут горячим — он тает!',
    cuisine: 'Американская',
    steps: [
      { ingredient: 'bun_bottom', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'bun_top', action: 'tap' },
    ]
  },
  bacon_burger: {
    id: 'bacon_burger', name: 'Бекон Бургер', icon: '🍔', category: 'fastfood', price: 75,
    servingGrams: 380, difficulty: 2, doneness: 'well-done',
    tip: 'Бекон жарь до хрустящей корочки!',
    cuisine: 'Американская',
    steps: [
      { ingredient: 'bun_bottom', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'bacon', action: 'tap' },
      { ingredient: 'bun_top', action: 'tap' },
    ]
  },
  double_burger: {
    id: 'double_burger', name: 'Двойной Бургер', icon: '🍔', category: 'fastfood', price: 95,
    servingGrams: 500, difficulty: 2, doneness: 'well-done',
    tip: 'Две котлеты — двойное счастье!',
    cuisine: 'Американская',
    steps: [
      { ingredient: 'bun_bottom', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'bun_top', action: 'tap' },
    ]
  },
  fish_burger: {
    id: 'fish_burger', name: 'Рыбный Бургер', icon: '🍔', category: 'seafood', price: 70,
    servingGrams: 300, difficulty: 2, doneness: 'fully-cooked',
    tip: 'Рыбу жарь на средним огне!', cuisine: 'Морская',
    steps: [
      { ingredient: 'bun_bottom', action: 'tap' },
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'bun_top', action: 'tap' },
    ]
  },
  mushroom_burger: {
    id: 'mushroom_burger', name: 'Грибной Бургер', icon: '🍔', category: 'meat', price: 80,
    servingGrams: 380, difficulty: 2, doneness: 'well-done',
    tip: 'Грибы нарежь потоньше!', cuisine: 'Фьюжн',
    steps: [
      { ingredient: 'bun_bottom', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'mushroom', action: 'swipe' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'bun_top', action: 'tap' },
    ]
  },
  hot_dog: {
    id: 'hot_dog', name: 'Хот-Дог', icon: '🌭', category: 'fastfood', price: 45,
    servingGrams: 160, difficulty: 1, doneness: 'fully-cooked',
    tip: 'Сосиска должна быть горячей!', cuisine: 'Американская',
    steps: [
      { ingredient: 'bread', action: 'tap' },
      { ingredient: 'sausage', action: 'tap' },
    ]
  },
  club_sandwich: {
    id: 'club_sandwich', name: 'Клаб-Сэндвич', icon: '🥪', category: 'meat', price: 65,
    servingGrams: 320, difficulty: 2, doneness: 'fully-cooked',
    tip: 'Тост должен быть хрустящим!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'toast', action: 'tap' },
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'toast', action: 'tap' },
    ]
  },
  veggie_sandwich: {
    id: 'veggie_sandwich', name: 'Вегги Сэндвич', icon: '🥪', category: 'healthy', price: 45,
    servingGrams: 280, difficulty: 1,
    tip: 'Овощи должны быть свежими!', cuisine: 'Здоровая',
    steps: [
      { ingredient: 'bread', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'cucumber', action: 'swipe' },
      { ingredient: 'cheese', action: 'tap' },
    ]
  },
  grilled_cheese: {
    id: 'grilled_cheese', name: 'Гриль-Сыр', icon: '🧀', category: 'fastfood', price: 40,
    servingGrams: 120, difficulty: 1, ovenTemp: 180, doneness: 'golden',
    tip: 'Масло не жалей — будет хрустящим!', cuisine: 'Американская',
    steps: [
      { ingredient: 'toast', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  bruschetta: {
    id: 'bruschetta', name: 'Брускетта', icon: '🍞', category: 'healthy', price: 55,
    servingGrams: 180, difficulty: 1, ovenTemp: 200,
    tip: 'Помидоры нарежь мелко!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'toast', action: 'tap' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
      { ingredient: 'herbs', action: 'tap' },
    ]
  },
  shawarma: {
    id: 'shawarma', name: 'Шаурма', icon: '🌯', category: 'meat', price: 85,
    servingGrams: 400, difficulty: 2, doneness: 'fully-cooked',
    tip: 'Всё нарезать мелко и плотно завернуть!', cuisine: 'Ближневосточная',
    steps: [
      { ingredient: 'bread', action: 'tap' },
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'cucumber', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  garlic_bread: {
    id: 'garlic_bread', name: 'Чесночный Хлеб', icon: '🥖', category: 'healthy', price: 60,
    servingGrams: 200, difficulty: 1, ovenTemp: 190,
    tip: 'Запекай до золотистой корочки!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'bread', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'garlic', action: 'swipe' },
      { ingredient: 'cheese', action: 'tap' },
    ]
  },

  // =========================================
  // СТЕЙКИ & МЯСО
  // =========================================
  classic_steak: {
    id: 'classic_steak', name: 'Стейк Классик', icon: '🥩', category: 'meat', price: 120,
    servingGrams: 250, difficulty: 3, ovenTemp: 200, doneness: 'medium',
    tip: 'Дай стейку «отдохнуть» 3 мин после жарки!', cuisine: 'Американская',
    steps: [
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'herbs', action: 'tap' },
    ]
  },
  t_bone_steak: {
    id: 't_bone_steak', name: 'T-Bone Стейк', icon: '🥩', category: 'meat', price: 150,
    servingGrams: 350, difficulty: 3, ovenTemp: 200, doneness: 'medium-rare',
    cookTimeSec: 480, tip: 'Готовь 4 мин с каждой стороны при 200°C!', cuisine: 'Американская',
    steps: [
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'garlic', action: 'swipe' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  pork_chop: {
    id: 'pork_chop', name: 'Свиная Отбивная', icon: '🍖', category: 'meat', price: 85,
    servingGrams: 400, difficulty: 2, ovenTemp: 180, doneness: 'well-done',
    cookTimeSec: 360, tip: 'Свинину всегда доводи до готовности!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'pork_ribs', action: 'tap' },
      { ingredient: 'potato', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  chicken_grilled: {
    id: 'chicken_grilled', name: 'Грилевая Курица', icon: '🍗', category: 'meat', price: 80,
    servingGrams: 280, difficulty: 2, ovenTemp: 175, doneness: 'fully-cooked',
    cookTimeSec: 300, tip: 'Лимон даёт кислинку и мягкость!', cuisine: 'Средиземноморская',
    steps: [
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'lemon', action: 'swipe' },
      { ingredient: 'herbs', action: 'tap' },
    ]
  },
  schnitzel: {
    id: 'schnitzel', name: 'Шницель', icon: '🥩', category: 'meat', price: 90,
    servingGrams: 220, difficulty: 2, doneness: 'golden',
    tip: 'Обваляй в муке перед жаркой!', cuisine: 'Австрийская',
    steps: [
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  meatballs: {
    id: 'meatballs', name: 'Тефтели', icon: '🍲', category: 'meat', price: 70,
    servingGrams: 300, difficulty: 2, doneness: 'fully-cooked',
    tip: 'Лук придаёт сочность!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
    ]
  },
  chicken_wings: {
    id: 'chicken_wings', name: 'Куриные Крылья', icon: '🍗', category: 'meat', price: 65,
    servingGrams: 400, difficulty: 2, ovenTemp: 200, doneness: 'crispy',
    cookTimeSec: 360, tip: 'Запекай до хрустящей корочки!', cuisine: 'Американская',
    steps: [
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  bbq_ribs: {
    id: 'bbq_ribs', name: 'BBQ Рёбра', icon: '🍖', category: 'meat', price: 140,
    servingGrams: 500, difficulty: 3, ovenTemp: 150, doneness: 'well-done',
    cookTimeSec: 900, tip: 'Медленная готовка = сочное мясо!', cuisine: 'Американская',
    steps: [
      { ingredient: 'pork_ribs', action: 'tap' },
      { ingredient: 'garlic', action: 'swipe' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  turkey_breast: {
    id: 'turkey_breast', name: 'Грудка Индейки', icon: '🍗', category: 'meat', price: 95,
    servingGrams: 300, difficulty: 2, ovenTemp: 165, doneness: 'fully-cooked',
    cookTimeSec: 480, tip: 'Масло не дает пересохнуть!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'herbs', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  lamb_kebab: {
    id: 'lamb_kebab', name: 'Люля-Кебаб', icon: '🍢', category: 'meat', price: 110,
    servingGrams: 300, difficulty: 3, doneness: 'medium',
    tip: 'Перец придаёт пикантность!', cuisine: 'Кавказская',
    steps: [
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'bell_pepper', action: 'swipe' },
    ]
  },
  chicken_schnitzel: {
    id: 'chicken_schnitzel', name: 'Куриный Шницель', icon: '🍗', category: 'meat', price: 80,
    servingGrams: 200, difficulty: 2, doneness: 'golden',
    tip: 'Отбей курицу перед жаркой!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'flour', action: 'tap' },
    ]
  },
  beef_stroganoff: {
    id: 'beef_stroganoff', name: 'Бефстроганов', icon: '🍲', category: 'meat', price: 95,
    servingGrams: 350, difficulty: 3, doneness: 'medium',
    tip: 'Крем делает соус нежным!', cuisine: 'Русская',
    steps: [
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'mushroom', action: 'swipe' },
      { ingredient: 'cream', action: 'swipe' },
    ]
  },
  steak_with_veg: {
    id: 'steak_with_veg', name: 'Стейк с Овощами', icon: '🥩', category: 'meat', price: 100,
    servingGrams: 400, difficulty: 2, doneness: 'medium',
    tip: 'Овощи добавляют баланс вкуса!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'carrot', action: 'swipe' },
      { ingredient: 'potato', action: 'swipe' },
    ]
  },

  // =========================================
  // СУПЫ
  // =========================================
  mushroom_soup: {
    id: 'mushroom_soup', name: 'Грибной Суп', icon: '🥣', category: 'soup', price: 50,
    servingGrams: 400, difficulty: 1,
    tip: 'Грибы дают насыщенный бульон!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'mushroom', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
    ]
  },
  borscht: {
    id: 'borscht', name: 'Борщ', icon: '🍲', category: 'russian', price: 110,
    servingGrams: 500, difficulty: 3,
    tip: 'Готовь на медленном огне не менее 40 мин!', cuisine: 'Русская/Украинская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'potato', action: 'swipe' },
      { ingredient: 'carrot', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'patty', action: 'tap' },
    ]
  },
  tomato_soup: {
    id: 'tomato_soup', name: 'Томатный Суп', icon: '🍅', category: 'soup', price: 55,
    servingGrams: 400, difficulty: 1,
    tip: 'Чеснок даёт аромат!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  chicken_soup: {
    id: 'chicken_soup', name: 'Куриный Суп', icon: '🥣', category: 'soup', price: 65,
    servingGrams: 450, difficulty: 2,
    tip: 'Морковь и лук — основа бульона!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'carrot', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
    ]
  },
  fish_chowder: {
    id: 'fish_chowder', name: 'Рыбный Чаудер', icon: '🥣', category: 'seafood', price: 80,
    servingGrams: 450, difficulty: 2,
    tip: 'Картофель загустит суп!', cuisine: 'Американская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'potato', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
    ]
  },
  ramen: {
    id: 'ramen', name: 'Рамен', icon: '🍜', category: 'asian', price: 150,
    servingGrams: 500, difficulty: 3,
    tip: 'Бульон вари не менее часа для насыщенности!', cuisine: 'Японская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'pasta', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'chicken', action: 'tap' },
    ]
  },
  onion_soup: {
    id: 'onion_soup', name: 'Луковый Суп', icon: '🥣', category: 'soup', price: 70,
    servingGrams: 350, difficulty: 2,
    tip: 'Карамелизируй лук 20 мин на маленьком огне!', cuisine: 'Французская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
    ]
  },
  pea_soup: {
    id: 'pea_soup', name: 'Гороховый Суп', icon: '🥣', category: 'soup', price: 60,
    servingGrams: 450, difficulty: 2,
    tip: 'Горох вари до полного размягчения!', cuisine: 'Русская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'peas', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'carrot', action: 'swipe' },
    ]
  },
  gazpacho: {
    id: 'gazpacho', name: 'Гаспачо', icon: '🍅', category: 'healthy', price: 65,
    servingGrams: 350, difficulty: 2,
    tip: 'Подавай холодным — освежает!', cuisine: 'Испанская',
    steps: [
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'cucumber', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  lentil_soup: {
    id: 'lentil_soup', name: 'Чечевичный Суп', icon: '🥣', category: 'soup', price: 55,
    servingGrams: 450, difficulty: 1,
    tip: 'Полезный и сытный!', cuisine: 'Ближневосточная',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'carrot', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  stew: {
    id: 'stew', name: 'Рагу', icon: '🍲', category: 'meat', price: 100,
    servingGrams: 500, difficulty: 2,
    tip: 'Тушить овощи не менее 30 минут!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'potato', action: 'swipe' },
      { ingredient: 'carrot', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  ukha: {
    id: 'ukha', name: 'Уха', icon: '🐟', category: 'russian', price: 85,
    servingGrams: 500, difficulty: 2,
    tip: 'Рыбный бульон — нежный и ароматный!', cuisine: 'Русская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'potato', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'carrot', action: 'swipe' },
    ]
  },

  // =========================================
  // ПАСТА & РИС
  // =========================================
  pasta_pomodoro: {
    id: 'pasta_pomodoro', name: 'Паста Помодоро', icon: '🍝', category: 'pasta', price: 55,
    servingGrams: 350, difficulty: 1, doneness: 'al-dente',
    tip: 'Варить пасту «al dente» — 1 мин до указанного времени!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'pasta', action: 'tap' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'cheese', action: 'tap' },
    ]
  },
  pasta_carbonara: {
    id: 'pasta_carbonara', name: 'Карбонара', icon: '🍝', category: 'pasta', price: 90,
    servingGrams: 380, difficulty: 3, doneness: 'al-dente',
    tip: 'Яйцо добавляй в конце без огня — иначе свернётся!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'pasta', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'bacon', action: 'tap' },
    ]
  },
  pasta_bolognese: {
    id: 'pasta_bolognese', name: 'Болоньезе', icon: '🍝', category: 'pasta', price: 85,
    servingGrams: 400, difficulty: 2, doneness: 'al-dente',
    tip: 'Соус тушить не менее 30 мин!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'pasta', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
    ]
  },
  pasta_pesto: {
    id: 'pasta_pesto', name: 'Паста Песто', icon: '🍝', category: 'pasta', price: 80,
    servingGrams: 350, difficulty: 2, doneness: 'al-dente',
    tip: 'Зелень — основа аромата песто!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'pasta', action: 'tap' },
      { ingredient: 'herbs', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  mushroom_risotto: {
    id: 'mushroom_risotto', name: 'Ризотто с Грибами', icon: '🍚', category: 'pasta', price: 100,
    servingGrams: 400, difficulty: 3, doneness: 'fully-cooked',
    tip: 'Помешивай постоянно — это секрет кремового ризотто!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'rice', action: 'tap' },
      { ingredient: 'mushroom', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  seafood_pasta: {
    id: 'seafood_pasta', name: 'Морская Паста', icon: '🍝', category: 'seafood', price: 120,
    servingGrams: 400, difficulty: 3, doneness: 'al-dente',
    tip: 'Морепродукты готовятся быстро — не пережарь!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'pasta', action: 'tap' },
      { ingredient: 'shrimp', action: 'tap' },
      { ingredient: 'garlic', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
    ]
  },
  mac_and_cheese: {
    id: 'mac_and_cheese', name: 'Мак-н-Чиз', icon: '🧀', category: 'fastfood', price: 65,
    servingGrams: 350, difficulty: 1,
    tip: 'Молоко делает соус сливочным!', cuisine: 'Американская',
    steps: [
      { ingredient: 'pasta', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'milk', action: 'tap' },
    ]
  },
  fried_rice: {
    id: 'fried_rice', name: 'Жареный Рис', icon: '🍳', category: 'asian', price: 60,
    servingGrams: 350, difficulty: 2,
    tip: 'Используй вчерашний рис — он лучше жарится!', cuisine: 'Азиатская',
    steps: [
      { ingredient: 'rice', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'carrot', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
    ]
  },
  paella: {
    id: 'paella', name: 'Паэлья', icon: '🍳', category: 'seafood', price: 140,
    servingGrams: 500, difficulty: 3,
    tip: 'Готовить без крышки на сильном огне!', cuisine: 'Испанская',
    steps: [
      { ingredient: 'rice', action: 'tap' },
      { ingredient: 'shrimp', action: 'tap' },
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'bell_pepper', action: 'swipe' },
    ]
  },
  pasta_alfredo: {
    id: 'pasta_alfredo', name: 'Паста Альфредо', icon: '🍝', category: 'pasta', price: 85,
    servingGrams: 380, difficulty: 2, doneness: 'al-dente',
    tip: 'Крем должен быть теплым, не горячим!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'pasta', action: 'tap' },
      { ingredient: 'cream', action: 'swipe' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },

  // =========================================
  // МОРЕПРОДУКТЫ
  // =========================================
  grilled_salmon: {
    id: 'grilled_salmon', name: 'Лосось на Гриле', icon: '🐠', category: 'seafood', price: 130,
    servingGrams: 280, difficulty: 2, ovenTemp: 180, doneness: 'medium',
    cookTimeSec: 300, tip: 'Лимон убирает рыбный запах!', cuisine: 'Скандинавская',
    steps: [
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'lemon', action: 'swipe' },
      { ingredient: 'herbs', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  sushi_roll: {
    id: 'sushi_roll', name: 'Суши Ролл', icon: '🍣', category: 'asian', price: 120,
    servingGrams: 250, difficulty: 3,
    tip: 'Рис должен быть чуть тёплым, рыба — холодной!', cuisine: 'Японская',
    steps: [
      { ingredient: 'rice', action: 'tap' },
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'cucumber', action: 'swipe' },
    ]
  },
  shrimp_stir_fry: {
    id: 'shrimp_stir_fry', name: 'Жареные Креветки', icon: '🦐', category: 'seafood', price: 95,
    servingGrams: 300, difficulty: 2, doneness: 'crispy',
    tip: 'Соевый соус добавляй в конце!', cuisine: 'Азиатская',
    steps: [
      { ingredient: 'shrimp', action: 'tap' },
      { ingredient: 'bell_pepper', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
      { ingredient: 'soy_sauce', action: 'tap' },
    ]
  },
  fish_chips: {
    id: 'fish_chips', name: 'Фиш & Чипс', icon: '🐟', category: 'fastfood', price: 75,
    servingGrams: 350, difficulty: 2, doneness: 'crispy',
    tip: 'Картошку жарь во фритюре!', cuisine: 'Британская',
    steps: [
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'potato', action: 'swipe' },
    ]
  },
  fish_tacos: {
    id: 'fish_tacos', name: 'Рыбные Тако', icon: '🌮', category: 'mexican', price: 80,
    servingGrams: 300, difficulty: 2,
    tip: 'Рыба и свежие овощи — идеальный тако!', cuisine: 'Мексиканская',
    steps: [
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'bread', action: 'tap' },
    ]
  },
  prawn_cocktail: {
    id: 'prawn_cocktail', name: 'Коктейль из Креветок', icon: '🦐', category: 'seafood', price: 90,
    servingGrams: 250, difficulty: 2,
    tip: 'Подавай охлаждённым!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'shrimp', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'lemon', action: 'swipe' },
      { ingredient: 'mayo', action: 'tap' },
    ]
  },
  tuna_salad: {
    id: 'tuna_salad', name: 'Салат с Тунцом', icon: '🥗', category: 'seafood', price: 70,
    servingGrams: 300, difficulty: 1,
    tip: 'Свежий огурец даёт хруст!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'cucumber', action: 'swipe' },
      { ingredient: 'mayo', action: 'tap' },
    ]
  },
  sushi_nigiri: {
    id: 'sushi_nigiri', name: 'Нигири', icon: '🍱', category: 'asian', price: 90,
    servingGrams: 200, difficulty: 3,
    tip: 'Рис лепи пальцами, рыбу клади сверху!', cuisine: 'Японская',
    steps: [
      { ingredient: 'rice', action: 'tap' },
      { ingredient: 'fish', action: 'tap' },
    ]
  },

  // =========================================
  // САЛАТЫ & ЗДОРОВАЯ ЕДА
  // =========================================
  fresh_salad: {
    id: 'fresh_salad', name: 'Свежий Салат', icon: '🥗', category: 'healthy', price: 40,
    servingGrams: 250, difficulty: 1,
    tip: 'Все овощи нарезать одинакового размера!', cuisine: 'Здоровая',
    steps: [
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'cucumber', action: 'swipe' },
    ]
  },
  chicken_salad: {
    id: 'chicken_salad', name: 'Цезарь', icon: '🥗', category: 'healthy', price: 75,
    servingGrams: 350, difficulty: 2,
    tip: 'Курица должна быть горячей, листья — холодными!', cuisine: 'Американская',
    steps: [
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'bread', action: 'swipe' },
    ]
  },
  greek_salad: {
    id: 'greek_salad', name: 'Греческий Салат', icon: '🥗', category: 'healthy', price: 65,
    servingGrams: 300, difficulty: 1,
    tip: 'Фета — обязательный компонент!', cuisine: 'Греческая',
    steps: [
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'cucumber', action: 'swipe' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
    ]
  },
  caprese_salad: {
    id: 'caprese_salad', name: 'Капрезе', icon: '🍅', category: 'healthy', price: 60,
    servingGrams: 250, difficulty: 1,
    tip: 'Чередуй помидор-сыр-помидор!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'herbs', action: 'tap' },
    ]
  },
  nicoise_salad: {
    id: 'nicoise_salad', name: 'Салат Нисуаз', icon: '🥗', category: 'healthy', price: 75,
    servingGrams: 350, difficulty: 2,
    tip: 'Яйцо вари вкрутую 10 минут!', cuisine: 'Французская',
    steps: [
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'fish', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'tomato', action: 'swipe' },
    ]
  },
  avocado_toast: {
    id: 'avocado_toast', name: 'Тост с Авокадо', icon: '🥑', category: 'healthy', price: 65,
    servingGrams: 200, difficulty: 1,
    tip: 'Авокадо должен быть спелым!', cuisine: 'Современная',
    steps: [
      { ingredient: 'toast', action: 'tap' },
      { ingredient: 'avocado', action: 'swipe' },
      { ingredient: 'lemon', action: 'swipe' },
      { ingredient: 'herbs', action: 'tap' },
    ]
  },
  quinoa_bowl: {
    id: 'quinoa_bowl', name: 'Боул с Киноа', icon: '🥣', category: 'healthy', price: 85,
    servingGrams: 400, difficulty: 2,
    tip: 'Киноа — суперфуд с полным набором белков!', cuisine: 'Фьюжн',
    steps: [
      { ingredient: 'rice', action: 'tap' },
      { ingredient: 'broccoli', action: 'tap' },
      { ingredient: 'avocado', action: 'swipe' },
      { ingredient: 'herbs', action: 'tap' },
    ]
  },
  cobb_salad: {
    id: 'cobb_salad', name: 'Салат Кобб', icon: '🥗', category: 'healthy', price: 80,
    servingGrams: 400, difficulty: 2,
    tip: 'Укладывай компоненты полосками!', cuisine: 'Американская',
    steps: [
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'bacon', action: 'tap' },
      { ingredient: 'tomato', action: 'swipe' },
    ]
  },

  // =========================================
  // ЗАВТРАК
  // =========================================
  fried_eggs: {
    id: 'fried_eggs', name: 'Яичница', icon: '🍳', category: 'breakfast', price: 30,
    servingGrams: 200, difficulty: 1, doneness: 'fully-cooked',
    tip: 'Жарь на маленьком огне чтобы желток остался жидким!', cuisine: 'Международная',
    steps: [
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'bacon', action: 'tap' },
    ]
  },
  scrambled_eggs: {
    id: 'scrambled_eggs', name: 'Яйца Болтунья', icon: '🍳', category: 'breakfast', price: 35,
    servingGrams: 200, difficulty: 1,
    tip: 'Помешивай постоянно на слабом огне!', cuisine: 'Международная',
    steps: [
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'milk', action: 'tap' },
    ]
  },
  omelet: {
    id: 'omelet', name: 'Омлет', icon: '🥚', category: 'breakfast', price: 50,
    servingGrams: 250, difficulty: 2,
    tip: 'Молоко делает омлет пышным!', cuisine: 'Французская',
    steps: [
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'milk', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
    ]
  },
  pancakes: {
    id: 'pancakes', name: 'Блинчики', icon: '🥞', category: 'breakfast', price: 50,
    servingGrams: 300, difficulty: 2, ovenTemp: 160,
    tip: 'Тесто должно отдохнуть 15 минут!', cuisine: 'Американская',
    steps: [
      { ingredient: 'milk', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
    ]
  },
  french_toast: {
    id: 'french_toast', name: 'Французский Тост', icon: '🍞', category: 'breakfast', price: 45,
    servingGrams: 220, difficulty: 2, doneness: 'golden',
    tip: 'Тост хорошо пропитай яйцом!', cuisine: 'Французская',
    steps: [
      { ingredient: 'toast', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
    ]
  },
  eggs_benedict: {
    id: 'eggs_benedict', name: 'Яйца Бенедикт', icon: '🍳', category: 'breakfast', price: 85,
    servingGrams: 280, difficulty: 3,
    tip: 'Яйцо пашот: 3 мин в едва кипящей воде!', cuisine: 'Американская',
    steps: [
      { ingredient: 'toast', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'bacon', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  waffles: {
    id: 'waffles', name: 'Вафли', icon: '🧇', category: 'breakfast', price: 60,
    servingGrams: 280, difficulty: 2, ovenTemp: 170,
    tip: 'Не открывай вафельницу раньше времени!', cuisine: 'Бельгийская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'milk', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
    ]
  },
  avocado_eggs: {
    id: 'avocado_eggs', name: 'Авокадо с Яйцом', icon: '🥑', category: 'breakfast', price: 65,
    servingGrams: 250, difficulty: 2,
    tip: 'Авокадо и яйцо — идеальный белково-жировой завтрак!', cuisine: 'Современная',
    steps: [
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'avocado', action: 'swipe' },
      { ingredient: 'bread', action: 'tap' },
      { ingredient: 'herbs', action: 'tap' },
    ]
  },

  // =========================================
  // ВЫПЕЧКА & СЛАДОСТИ
  // =========================================
  berry_cake: {
    id: 'berry_cake', name: 'Ягодный Торт', icon: '🍰', category: 'sweet', price: 90,
    servingGrams: 350, difficulty: 2, ovenTemp: 175,
    tip: 'Корж должен полностью остыть перед кремом!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'cake_base', action: 'tap' },
      { ingredient: 'cream', action: 'swipe' },
      { ingredient: 'berry', action: 'tap' },
    ]
  },
  chocolate_cake: {
    id: 'chocolate_cake', name: 'Шоко Торт', icon: '🎂', category: 'sweet', price: 100,
    servingGrams: 380, difficulty: 2, ovenTemp: 175,
    tip: 'Шоколад растопи на водяной бане!', cuisine: 'Европейская',
    steps: [
      { ingredient: 'cake_base', action: 'tap' },
      { ingredient: 'cream', action: 'swipe' },
      { ingredient: 'chocolate', action: 'tap' },
    ]
  },
  croissant: {
    id: 'croissant', name: 'Круассан', icon: '🥐', category: 'bakery', price: 65,
    servingGrams: 180, difficulty: 3, ovenTemp: 190,
    cookTimeSec: 1200, tip: 'Много слоёв масла — секрет хрустящих круассанов!', cuisine: 'Французская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
    ]
  },
  muffin: {
    id: 'muffin', name: 'Маффин', icon: '🧁', category: 'bakery', price: 55,
    servingGrams: 120, difficulty: 1, ovenTemp: 180,
    cookTimeSec: 1200, tip: 'Не перемешивай тесто слишком сильно!', cuisine: 'Американская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'berry', action: 'tap' },
    ]
  },
  donut: {
    id: 'donut', name: 'Пончик', icon: '🍩', category: 'sweet', price: 55,
    servingGrams: 100, difficulty: 2, doneness: 'golden',
    tip: 'Жарь во фритюре при 175°C!', cuisine: 'Американская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'chocolate', action: 'tap' },
    ]
  },
  apple_pie: {
    id: 'apple_pie', name: 'Яблочный Пирог', icon: '🥧', category: 'bakery', price: 100,
    servingGrams: 280, difficulty: 2, ovenTemp: 180,
    cookTimeSec: 2400, tip: 'Яблоки нарежь тонко — так пропекутся быстрее!', cuisine: 'Американская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'apple', action: 'swipe' },
      { ingredient: 'sugar', action: 'tap' },
    ]
  },
  cheesecake: {
    id: 'cheesecake', name: 'Чизкейк', icon: '🍰', category: 'sweet', price: 120,
    servingGrams: 250, difficulty: 3, ovenTemp: 160,
    cookTimeSec: 3600, tip: 'Выпекай на водяной бане чтобы не треснул!', cuisine: 'Американская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'cream', action: 'swipe' },
      { ingredient: 'sugar', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
    ]
  },
  tiramisu: {
    id: 'tiramisu', name: 'Тирамису', icon: '🍮', category: 'sweet', price: 130,
    servingGrams: 250, difficulty: 3,
    tip: 'Охлаждать минимум 4 часа!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'cake_base', action: 'tap' },
      { ingredient: 'cream', action: 'swipe' },
      { ingredient: 'chocolate', action: 'tap' },
      { ingredient: 'coffee', action: 'tap' },
    ]
  },
  macaron: {
    id: 'macaron', name: 'Макарон', icon: '🍪', category: 'sweet', price: 95,
    servingGrams: 80, difficulty: 3, ovenTemp: 150,
    cookTimeSec: 900, tip: 'Меренга должна быть идеальной — не торопись!', cuisine: 'Французская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
      { ingredient: 'cream', action: 'swipe' },
    ]
  },
  cinnamon_roll: {
    id: 'cinnamon_roll', name: 'Булочка с Корицей', icon: '🍥', category: 'bakery', price: 70,
    servingGrams: 160, difficulty: 2, ovenTemp: 180,
    cookTimeSec: 1800, tip: 'Дай тесту подойти 1 час!', cuisine: 'Американская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
      { ingredient: 'cinnamon', action: 'tap' },
    ]
  },
  lemon_tart: {
    id: 'lemon_tart', name: 'Лимонный Тарт', icon: '🍋', category: 'sweet', price: 85,
    servingGrams: 200, difficulty: 3, ovenTemp: 170,
    tip: 'Лимонный курд должен быть кислым!', cuisine: 'Французская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'lemon', action: 'swipe' },
      { ingredient: 'sugar', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
    ]
  },
  brownie: {
    id: 'brownie', name: 'Брауни', icon: '🍫', category: 'sweet', price: 75,
    servingGrams: 150, difficulty: 2, ovenTemp: 175,
    cookTimeSec: 1800, tip: 'Не пересуши — внутри должно быть влажным!', cuisine: 'Американская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'chocolate', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
    ]
  },
  ice_cream: {
    id: 'ice_cream', name: 'Мороженое', icon: '🍨', category: 'sweet', price: 70,
    servingGrams: 200, difficulty: 2,
    tip: 'Мешай каждые 30 мин при заморозке!', cuisine: 'Международная',
    steps: [
      { ingredient: 'milk', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
      { ingredient: 'cream', action: 'swipe' },
      { ingredient: 'berry', action: 'tap' },
    ]
  },
  pie: {
    id: 'pie', name: 'Круглый Пирог', icon: '🥧', category: 'sweet', price: 130,
    servingGrams: 350, difficulty: 2, ovenTemp: 180,
    cookTimeSec: 2400, tip: 'Делай решётку из теста сверху!', cuisine: 'Американская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
      { ingredient: 'berry', action: 'tap' },
      { ingredient: 'sugar', action: 'tap' },
    ]
  },

  // =========================================
  // ПИЦЦА
  // =========================================
  pizza_margarita: {
    id: 'pizza_margarita', name: 'Пицца Маргарита', icon: '🍕', category: 'healthy', price: 95,
    servingGrams: 400, difficulty: 2, ovenTemp: 230,
    cookTimeSec: 600, tip: 'Печь должна быть максимально горячей!', cuisine: 'Итальянская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'cheese', action: 'tap' },
    ]
  },

  // =========================================
  // АЗИАТСКАЯ КУХНЯ
  // =========================================
  pad_thai: {
    id: 'pad_thai', name: 'Пад Тай', icon: '🍜', category: 'asian', price: 105,
    servingGrams: 400, difficulty: 3,
    tip: 'Соевый соус регулирует солёность!', cuisine: 'Тайская',
    steps: [
      { ingredient: 'pasta', action: 'tap' },
      { ingredient: 'shrimp', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'soy_sauce', action: 'tap' },
    ]
  },
  spring_rolls: {
    id: 'spring_rolls', name: 'Спринг-Роллы', icon: '🥢', category: 'asian', price: 80,
    servingGrams: 300, difficulty: 2, doneness: 'crispy',
    tip: 'Жарь до хрустящей золотистой корочки!', cuisine: 'Вьетнамская',
    steps: [
      { ingredient: 'bread', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'shrimp', action: 'tap' },
      { ingredient: 'carrot', action: 'swipe' },
    ]
  },
  dumplings: {
    id: 'dumplings', name: 'Дим Сам', icon: '🥟', category: 'asian', price: 85,
    servingGrams: 300, difficulty: 3, ovenTemp: 100,
    tip: 'Готовь на пару 8-10 минут!', cuisine: 'Китайская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  teriyaki_chicken: {
    id: 'teriyaki_chicken', name: 'Курица Терияки', icon: '🍗', category: 'asian', price: 95,
    servingGrams: 300, difficulty: 2, doneness: 'fully-cooked',
    tip: 'Соевый соус карамелизируется — не жги!', cuisine: 'Японская',
    steps: [
      { ingredient: 'chicken', action: 'tap' },
      { ingredient: 'soy_sauce', action: 'tap' },
      { ingredient: 'garlic', action: 'swipe' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  miso_soup: {
    id: 'miso_soup', name: 'Мисо Суп', icon: '🍜', category: 'asian', price: 55,
    servingGrams: 350, difficulty: 1,
    tip: 'Не кипяти после добавления мисо-пасты!', cuisine: 'Японская',
    steps: [
      { ingredient: 'water', action: 'tap' },
      { ingredient: 'mushroom', action: 'swipe' },
      { ingredient: 'herbs', action: 'tap' },
    ]
  },
  gyoza: {
    id: 'gyoza', name: 'Гёдза', icon: '🥟', category: 'asian', price: 80,
    servingGrams: 250, difficulty: 3, doneness: 'crispy',
    tip: 'Сначала обжарь, потом добавь воду и закрой крышку!', cuisine: 'Японская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  bibimbap: {
    id: 'bibimbap', name: 'Пибимпап', icon: '🍚', category: 'asian', price: 100,
    servingGrams: 450, difficulty: 2,
    tip: 'Рис должен быть тёплым, яйцо — с жидким желтком!', cuisine: 'Корейская',
    steps: [
      { ingredient: 'rice', action: 'tap' },
      { ingredient: 'carrot', action: 'swipe' },
      { ingredient: 'mushroom', action: 'swipe' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'soy_sauce', action: 'tap' },
    ]
  },

  // =========================================
  // РУССКАЯ КУХНЯ
  // =========================================
  pelmeni: {
    id: 'pelmeni', name: 'Пельмени', icon: '🥟', category: 'russian', price: 80,
    servingGrams: 400, difficulty: 2,
    tip: 'Вари в подсоленной воде 7-8 минут!', cuisine: 'Русская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'onion', action: 'swipe' },
    ]
  },
  olivier_salad: {
    id: 'olivier_salad', name: 'Салат Оливье', icon: '🥗', category: 'russian', price: 70,
    servingGrams: 400, difficulty: 2,
    tip: 'Все ингредиенты нарезать мелким кубиком!', cuisine: 'Русская',
    steps: [
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'potato', action: 'swipe' },
      { ingredient: 'carrot', action: 'swipe' },
      { ingredient: 'cucumber', action: 'swipe' },
      { ingredient: 'mayo', action: 'tap' },
    ]
  },
  blini: {
    id: 'blini', name: 'Блины', icon: '🥞', category: 'russian', price: 60,
    servingGrams: 250, difficulty: 2,
    tip: 'Первый блин — всегда комом! Продолжай!', cuisine: 'Русская',
    steps: [
      { ingredient: 'milk', action: 'tap' },
      { ingredient: 'egg', action: 'tap' },
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'butter', action: 'tap' },
    ]
  },
  french_fries: {
    id: 'french_fries', name: 'Картофель Фри', icon: '🍟', category: 'fastfood', price: 40,
    servingGrams: 200, difficulty: 1, doneness: 'crispy',
    tip: 'Дважды обжаривай для хруста!', cuisine: 'Бельгийская',
    steps: [
      { ingredient: 'potato', action: 'swipe' },
      { ingredient: 'potato', action: 'swipe' },
    ]
  },

  // =========================================
  // МЕКСИКАНСКАЯ КУХНЯ
  // =========================================
  tacos: {
    id: 'tacos', name: 'Тако', icon: '🌮', category: 'mexican', price: 75,
    servingGrams: 300, difficulty: 2,
    tip: 'Мясо жарь до хрустящей корочки!', cuisine: 'Мексиканская',
    steps: [
      { ingredient: 'bread', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'lettuce', action: 'swipe' },
      { ingredient: 'tomato', action: 'swipe' },
    ]
  },
  nachos: {
    id: 'nachos', name: 'Начос', icon: '🫔', category: 'mexican', price: 55,
    servingGrams: 300, difficulty: 1, ovenTemp: 200,
    tip: 'Запекай до расплавления сыра!', cuisine: 'Мексиканская',
    steps: [
      { ingredient: 'flour', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'tomato', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  guacamole: {
    id: 'guacamole', name: 'Гуакамоле', icon: '🥑', category: 'mexican', price: 55,
    servingGrams: 200, difficulty: 1,
    tip: 'Авокадо разминай вилкой, не блендером!', cuisine: 'Мексиканская',
    steps: [
      { ingredient: 'avocado', action: 'swipe' },
      { ingredient: 'lemon', action: 'swipe' },
      { ingredient: 'onion', action: 'swipe' },
      { ingredient: 'garlic', action: 'swipe' },
    ]
  },
  quesadilla: {
    id: 'quesadilla', name: 'Кесадилья', icon: '🫔', category: 'mexican', price: 70,
    servingGrams: 300, difficulty: 2, doneness: 'golden',
    tip: 'Обжаривай с двух сторон до золотистости!', cuisine: 'Мексиканская',
    steps: [
      { ingredient: 'bread', action: 'tap' },
      { ingredient: 'cheese', action: 'tap' },
      { ingredient: 'patty', action: 'tap' },
      { ingredient: 'bell_pepper', action: 'swipe' },
    ]
  },
};

// Типизированные id персонажей — чтобы не дублировать строки по проекту
export const CHARACTER_IDS = {
  CAT: 'cat',
  BAUKA: 'bauka',
  DOG: 'dog',
  RABBIT: 'rabbit',
  BEAR: 'bear',
  FOX: 'fox',
  PANDA: 'panda',
  KOALA: 'koala',
  TIGER: 'tiger',
  LION: 'lion',
  PIG: 'pig',
} as const;

export const CHARACTERS: Character[] = [
  { id: CHARACTER_IDS.CAT, name: 'Кот', animal: '😸', color: 'bg-orange-500', type: 'meat' },
  { id: CHARACTER_IDS.BAUKA, name: 'Баука', animal: '😽', color: 'bg-rose-500', type: 'meat' },
  { id: CHARACTER_IDS.DOG, name: 'Пёс', animal: '🐶', color: 'bg-amber-700', type: 'meat' },
  { id: CHARACTER_IDS.RABBIT, name: 'Кролик', animal: '🐰', color: 'bg-rose-400', type: 'healthy' },
  { id: CHARACTER_IDS.BEAR, name: 'Мишка', animal: '🐻', color: 'bg-stone-600', type: 'sweet' },
  { id: CHARACTER_IDS.FOX, name: 'Лиса', animal: '🦊', color: 'bg-orange-600', type: 'universal' },
  { id: CHARACTER_IDS.PANDA, name: 'Панда', animal: '🐼', color: 'bg-slate-800', type: 'healthy' },
  { id: CHARACTER_IDS.KOALA, name: 'Коала', animal: '🐨', color: 'bg-slate-500', type: 'sweet' },
  { id: CHARACTER_IDS.TIGER, name: 'Тигр', animal: '🐯', color: 'bg-orange-400', type: 'meat' },
  { id: CHARACTER_IDS.LION, name: 'Лев', animal: '🦁', color: 'bg-amber-500', type: 'meat' },
  { id: CHARACTER_IDS.PIG, name: 'Свинка', animal: '🐷', color: 'bg-pink-400', type: 'universal' },
];

// Реплики Бауки — становятся всё более «преданными» по мере подачи блюд
export const BAUKA_PHRASES: string[] = [
  'ВАУ! Это лучшая еда в моей жизни! 🤩',
  'Ммм, нереально вкусно! Давай ещё! 😋',
  'Я в жизни не ел ничего вкуснее! 😍',
  'Ты мой любимый шеф на свете! 💖',
  'Это пальчики оближешь, шедевр! 👌',
  'Я расскажу о тебе всем друзьям! 🌟',
  'Это пир богов, не меньше! 👑',
  'Я твой фанат №1 навсегда! 🐻💕',
  'Каждое блюдо — настоящий шедевр! 🎨',
  'Ты готовишь как волшебник! ✨',
  'Я бы ел твою стряпню вечно! ♾️',
  'БРАВИССИМО, маэстро кухни! 👏',
];

// Баука притворяется недовольным (каждое 3-е блюдо) — придирается к вкусу,
// пока не получит «чапалак».
export const BAUKA_DISLIKE_PHRASES: string[] = [
  'Фу… какой-то привкус не такой… 🤢',
  'Мм, чего-то не хватает… не очень 😒',
  'Хм… соли маловато, что ли? 🤨',
  'Не-е, сегодня как-то не айс… 😕',
  'Привкус странный какой-то… 🤢',
];
