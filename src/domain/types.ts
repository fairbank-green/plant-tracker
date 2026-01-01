// types.ts
export const FOOD_CATEGORIES = {
    WHOLE_GRAINS: 'whole_grains',
    NUTS_SEEDS: 'nuts_seeds',
    FRUITS: 'fruits',
    VEGETABLES: 'vegetables',
    LEGUMES: 'legumes',
    HERBS_SPICES: 'herbs_spices',
  } as const;
  
  export const FOOD_COLORS = {
    RED: 'red',
    ORANGE: 'orange',
    YELLOW: 'yellow',
    GREEN: 'green',
    BLUE_PURPLE: 'blue_purple',
    WHITE_TAN: 'white_tan',
  } as const;
  
  export type FoodCategory = typeof FOOD_CATEGORIES[keyof typeof FOOD_CATEGORIES];
  export type FoodColor = typeof FOOD_COLORS[keyof typeof FOOD_COLORS];
  
  // Point values by category
  export const CATEGORY_POINT_VALUES: Record<FoodCategory, number> = {
    [FOOD_CATEGORIES.WHOLE_GRAINS]: 1,
    [FOOD_CATEGORIES.NUTS_SEEDS]: 1,
    [FOOD_CATEGORIES.FRUITS]: 1,
    [FOOD_CATEGORIES.VEGETABLES]: 1,
    [FOOD_CATEGORIES.LEGUMES]: 1,
    [FOOD_CATEGORIES.HERBS_SPICES]: 0.25,
  };
  
  export interface Food {
    foodId: string;
    name: string;
    category: FoodCategory;
  }
  
  export interface WeeklyFoodEntry {
    instanceId: string;
    foodId: string;
    foodName: string;
    category: FoodCategory;
    color: FoodColor;
    isFermented: boolean;
    loggedDate: Date;
    pointValue: number;
  }
  
  export interface CategoryBreakdown {
    whole_grains: number;
    nuts_seeds: number;
    fruits: number;
    vegetables: number;
    legumes: number;
    herbs_spices: number;
  }
  
  export interface WeeklyTrackingData {
    userId: string;
    weekStart: Date;
    weekEnd: Date;
    foodInstances: WeeklyFoodEntry[];
    uniqueFoods: string[]; // array of unique foodIds
    totalPoints: number;
    categoryBreakdown: CategoryBreakdown;
    colorsAchieved: FoodColor[];
    currentStreak: number;
  }
  
  export interface DailyTrackingData {
    userId: string;
    date: Date;
    waterGlasses: number;
    colorsEaten: FoodColor[];
    fermentedFoodEaten: boolean;
  }