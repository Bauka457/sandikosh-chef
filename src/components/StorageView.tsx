import { INGREDIENTS } from '../data';
import { IngredientType } from '../types';
import { cn } from '../utils';

interface Props {
  stock: Record<IngredientType, number>;
  onTake: (id: IngredientType) => void;
}

export function StorageView({ stock, onTake }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-amber-50 border-t border-amber-200">
      <div className="grid grid-cols-3 gap-3">
        {Object.values(INGREDIENTS).map((ing) => {
          const currentStock = stock[ing.id];
          const isLow = currentStock / ing.maxStock < 0.3;
          const isEmpty = currentStock === 0;

          return (
            <div
              key={ing.id}
              className={cn(
                "flex flex-col items-center bg-white p-2 rounded-2xl shadow-sm border-2 transition-all",
                isLow && !isEmpty ? 'border-orange-300' : isEmpty ? 'border-rose-400 opacity-75' : 'border-amber-100'
              )}
            >
              <button
                disabled={isEmpty}
                onClick={() => onTake(ing.id)}
                className="text-4xl h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center active:scale-95 disabled:grayscale"
              >
                {ing.icon}
              </button>
              
              <div className="w-full flex items-center justify-between mt-2 px-1">
                <span className="text-xs font-bold text-slate-500 truncate max-w-[60px]">
                  {ing.name}
                </span>
                <span className={cn(
                  "text-xs font-black",
                  isEmpty ? "text-rose-500" : isLow ? "text-orange-500" : "text-emerald-500"
                )}>
                  {currentStock}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-amber-100 mt-1 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full", isLow ? "bg-rose-400" : "bg-emerald-400")} 
                  style={{ width: `${(currentStock / ing.maxStock) * 100}%` }}
                />
              </div>

              {isEmpty && (
                <div className="mt-1 text-[9px] font-black text-rose-500 text-center">Освободи место</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
