// src/stores/weeklyStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FoodCategory, FoodColor } from '../domain/types.js';
import type { WeeklyFoodInstance } from '../domain/weekly.js';
import {
  addFoodToWeek,
  getUniqueFoodIds,
} from '../domain/weekly.js';
import {
  calculateWeeklyPoints,
  calculateCategoryBreakdown,
  type FoodForPoints,
} from '../domain/points.js';
import { calculateWeeklyColors } from '../domain/colors.js';
import { getWeekStart, getWeekEnd } from '../domain/dates.js';
import {
  saveWeeklyData,
  loadWeeklyData,
  type WeeklyDataRecord,
  type WeeklyFoodInstanceRecord,
} from '../infrastructure/db.js';

export const useWeeklyStore = defineStore('weekly', () => {
  // ============================================================================
  // State
  // ============================================================================

  const userId = ref<string>('default-user'); // Would be set from auth
  const weekStart = ref<Date>(getWeekStart(new Date()));
  const weekEnd = ref<Date>(getWeekEnd(new Date()));
  const foodInstances = ref<WeeklyFoodInstance[]>([]);
  const currentStreak = ref<number>(0);
  const isInitialized = ref<boolean>(false);

  // ============================================================================
  // Computed (Derived State)
  // ============================================================================

  /**
   * Get unique food IDs (for point calculation)
   */
  const uniqueFoodIds = computed(() => {
    return getUniqueFoodIds(foodInstances.value);
  });

  /**
   * Calculate total weekly points using domain logic
   */
  const totalPoints = computed(() => {
    const foods: FoodForPoints[] = uniqueFoodIds.value.map(foodId => {
      const instance = foodInstances.value.find(i => i.foodId === foodId);
      return {
        foodId: instance!.foodId,
        category: instance!.category,
      };
    });
    
    return calculateWeeklyPoints(foods);
  });

  /**
   * Calculate category breakdown using domain logic
   */
  const categoryBreakdown = computed(() => {
    const foods: FoodForPoints[] = uniqueFoodIds.value.map(foodId => {
      const instance = foodInstances.value.find(i => i.foodId === foodId);
      return {
        foodId: instance!.foodId,
        category: instance!.category,
      };
    });
    
    return calculateCategoryBreakdown(foods);
  });

  /**
   * Calculate colors achieved this week using domain logic
   */
  const colorsAchieved = computed(() => {
    return calculateWeeklyColors(foodInstances.value);
  });

  /**
   * Check if weekly goal achieved (>= 30 points)
   */
  const goalAchieved = computed(() => {
    return totalPoints.value >= 30;
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Initialize store by loading data from IndexedDB
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) {
      return;
    }

    const data = await loadWeeklyData(userId.value);
    
    if (data) {
      // Convert ISO strings back to Date objects
      weekStart.value = new Date(data.weekStart);
      weekEnd.value = new Date(data.weekEnd);
      currentStreak.value = data.currentStreak;
      
      // Convert stored instances to domain instances
      foodInstances.value = data.foodInstances.map(convertRecordToInstance);
    } else {
      // Initialize with empty week
      weekStart.value = getWeekStart(new Date());
      weekEnd.value = getWeekEnd(new Date());
      foodInstances.value = [];
      currentStreak.value = 0;
    }

    isInitialized.value = true;
  }

  /**
   * Add a food instance to the week
   */
  async function addFood(food: {
    foodId: string;
    foodName: string;
    category: FoodCategory;
    color: FoodColor;
    isFermented: boolean;
    pointValue: number;
  }): Promise<{ success: boolean; isDuplicate: boolean }> {
    const newFood = {
      foodId: food.foodId,
      foodName: food.foodName,
      category: food.category,
      color: food.color,
      isFermented: food.isFermented,
      loggedDate: new Date(),
      pointValue: food.pointValue,
    };

    const result = addFoodToWeek(foodInstances.value, newFood);

    if (result.isDuplicateInstance) {
      return { success: false, isDuplicate: true };
    }

    foodInstances.value = result.foods;
    await persistToDb();

    return { success: true, isDuplicate: false };
  }

  /**
   * Remove a food instance by instanceId
   */
  async function removeFood(instanceId: string): Promise<void> {
    foodInstances.value = foodInstances.value.filter(
      instance => instance.instanceId !== instanceId
    );
    await persistToDb();
  }

  /**
   * Update a food instance
   */
  async function updateFood(
    instanceId: string,
    updates: {
      color?: FoodColor;
      isFermented?: boolean;
    }
  ): Promise<void> {
    const instance = foodInstances.value.find(i => i.instanceId === instanceId);
    
    if (!instance) {
      return;
    }

    if (updates.color !== undefined) {
      instance.color = updates.color;
    }
    
    if (updates.isFermented !== undefined) {
      instance.isFermented = updates.isFermented;
    }

    await persistToDb();
  }

  /**
   * Reset the week (clear all food instances)
   */
  async function resetWeek(): Promise<void> {
    weekStart.value = getWeekStart(new Date());
    weekEnd.value = getWeekEnd(new Date());
    foodInstances.value = [];
    await persistToDb();
  }

  /**
   * Set the streak value (called after archiving)
   */
  function setStreak(streak: number): void {
    currentStreak.value = streak;
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Persist current state to IndexedDB
   */
  async function persistToDb(): Promise<void> {
    const record: WeeklyDataRecord = {
      id: userId.value,
      userId: userId.value,
      weekStart: weekStart.value.toISOString(),
      weekEnd: weekEnd.value.toISOString(),
      foodInstances: foodInstances.value.map(convertInstanceToRecord),
      uniqueFoods: [...uniqueFoodIds.value], // Convert to plain array
      totalPoints: totalPoints.value,
      categoryBreakdown: {
        whole_grains: categoryBreakdown.value.whole_grains,
        nuts_seeds: categoryBreakdown.value.nuts_seeds,
        fruits: categoryBreakdown.value.fruits,
        vegetables: categoryBreakdown.value.vegetables,
        legumes: categoryBreakdown.value.legumes,
        herbs_spices: categoryBreakdown.value.herbs_spices,
      },
      colorsAchieved: [...colorsAchieved.value], // Convert to plain array
      currentStreak: currentStreak.value,
    };

    await saveWeeklyData(record);
  }

  /**
   * Convert DB record to domain instance
   */
  function convertRecordToInstance(
    record: WeeklyFoodInstanceRecord
  ): WeeklyFoodInstance {
    return {
      instanceId: record.instanceId,
      foodId: record.foodId,
      foodName: record.foodName,
      category: record.category,
      color: record.color,
      isFermented: record.isFermented,
      loggedDate: new Date(record.loggedDate),
      pointValue: record.pointValue,
      firstLoggedDate: new Date(record.firstLoggedDate),
    };
  }

  /**
   * Convert domain instance to DB record
   */
  function convertInstanceToRecord(
    instance: WeeklyFoodInstance
  ): WeeklyFoodInstanceRecord {
    return {
      instanceId: instance.instanceId,
      foodId: instance.foodId,
      foodName: instance.foodName,
      category: instance.category,
      color: instance.color,
      isFermented: instance.isFermented,
      loggedDate: instance.loggedDate.toISOString(),
      pointValue: instance.pointValue,
      firstLoggedDate: instance.firstLoggedDate!.toISOString(),
    };
  }

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    userId,
    weekStart,
    weekEnd,
    foodInstances,
    currentStreak,
    isInitialized,

    // Computed
    uniqueFoodIds,
    totalPoints,
    categoryBreakdown,
    colorsAchieved,
    goalAchieved,

    // Actions
    initialize,
    addFood,
    removeFood,
    updateFood,
    resetWeek,
    setStreak,
  };
});