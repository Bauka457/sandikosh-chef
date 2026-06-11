export type IngredientType = string;
export type ProcessType = 'cook' | 'cut' | 'bake' | 'mix' | 'boil' | 'none';
export type RecipeCategory =
  | 'meat' | 'healthy' | 'sweet' | 'seafood' | 'soup'
  | 'fastfood' | 'pasta' | 'breakfast' | 'bakery'
  | 'asian' | 'russian' | 'mexican';

export type DonenessLevel =
  | 'raw' | 'rare' | 'medium-rare' | 'medium'
  | 'well-done' | 'crispy' | 'al-dente' | 'golden' | 'fully-cooked';

export interface Ingredient {
  id: IngredientType;
  name: string;
  icon: string;
  maxStock: number;
  process: ProcessType;
  processRequired?: number;
  grams?: number;
}

export type CharacterType = 'universal' | 'meat' | 'sweet' | 'healthy';

export interface Character {
  id: string;
  name: string;
  animal: string;
  color: string;
  type: CharacterType;
}

export type RecipeId = string;

export interface RecipeStep {
  ingredient: IngredientType;
  action: 'tap' | 'swipe' | 'hold';
}

export interface Recipe {
  id: RecipeId;
  name: string;
  icon: string;
  category: RecipeCategory;
  price: number;
  steps: RecipeStep[];
  ovenTemp?: number;       // °C
  cookTimeSec?: number;    // seconds
  servingGrams?: number;   // grams per serving
  difficulty?: 1 | 2 | 3; // 1=easy 2=medium 3=hard
  doneness?: DonenessLevel;
  tip?: string;
  cuisine?: string;
}

export interface Order {
  id: string;
  characterId: string;
  recipeId: RecipeId;
  timeLeft: number;
  maxTime: number;
  status: 'waiting' | 'eating' | 'leaving' | 'done';
  reaction?: 'wow' | 'bauka_wow' | 'sad' | 'good';
  specialRequest?: 'extra_hot' | 'no_spice' | 'large_portion';
  tip?: number; // бонус за выполнение спецзапроса
}

export interface PrepItem {
  id: string;
  ingredientId: IngredientType;
  state: 'raw' | 'processing' | 'ready' | 'burned';
  progress: number; // 0–100
}
