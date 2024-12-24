export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary?: string;
  instructions?: string;
  extendedIngredients?: Array<{
    id: number;
    original: string;
    amount: number;
    unit: string;
    name: string;
  }>;
  cuisines?: string[];
  diets?: string[];
  dishTypes?: string[];
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
} 