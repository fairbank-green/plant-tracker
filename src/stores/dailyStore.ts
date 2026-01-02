// src/stores/dailyStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FoodColor } from '../domain/types.js';
import { calculateDailyColors } from '../domain/colors.js';
import { shouldResetDaily, isSameDay } from '../domain/dates.js';
import {
  saveDailyData,
  loadDailyData,
  type DailyDataRecord,
} from '../infrastructure/db.js';

// Constants
const WATER_MIN = 0;
const WATER_MAX = 20;
const WATER_TARGET = 8;

export const useDailyStore = defineStore('daily', () => {
  // ============================================================================
  // State
  // ============================================================================

  const userId = ref<string>('default-user'); // Would be set from auth
  const currentDateString = ref<string>(formatDateString(new Date()));
  const waterGlasses = ref<number>(0);
  const colorsEaten = ref<FoodColor[]>([]);
  const fermentedFoodEaten = ref<boolean>(false);
  const isInitialized = ref<boolean>(false);

  // ============================================================================
  // Computed (Derived State)
  // ============================================================================

  /**
   * Check if water goal achieved (>= 8 glasses)
   */
  const waterGoalAchieved = computed(() => {
    return waterGlasses.value >= WATER_TARGET;
  });

  /**
   * Number of colors achieved today
   */
  const colorsCount = computed(() => {
    return colorsEaten.value.length;
  });

  /**
   * Check if all 6 colors achieved today
   */
  const allColorsAchieved = computed(() => {
    return colorsEaten.value.length === 6;
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

    currentDateString.value = formatDateString(new Date());
    await loadTodayData();
    isInitialized.value = true;
  }

  /**
   * Check if we need to reset daily data (new day)
   * Call this periodically or on app focus
   */
  async function checkForDayReset(): Promise<void> {
    const now = new Date();
    const currentDate = parseDateString(currentDateString.value);
    
    if (shouldResetDaily(now, currentDate)) {
      await resetForNewDay(now);
    }
  }

  /**
   * Increment water counter
   */
  async function incrementWater(): Promise<void> {
    if (waterGlasses.value < WATER_MAX) {
      waterGlasses.value++;
      await persistToDb();
    }
  }

  /**
   * Decrement water counter
   */
  async function decrementWater(): Promise<void> {
    if (waterGlasses.value > WATER_MIN) {
      waterGlasses.value--;
      await persistToDb();
    }
  }

  /**
   * Set water glasses to specific value
   */
  async function setWaterGlasses(count: number): Promise<void> {
    if (count >= WATER_MIN && count <= WATER_MAX) {
      waterGlasses.value = count;
      await persistToDb();
    }
  }

  /**
   * Add a color to today's colors (if not already present)
   * This is called when a food is logged with a color
   */
  async function addColor(color: FoodColor): Promise<void> {
    if (!colorsEaten.value.includes(color)) {
      colorsEaten.value.push(color);
      await persistToDb();
    }
  }

  /**
   * Mark that a fermented food was eaten today
   */
  async function markFermentedFood(): Promise<void> {
    if (!fermentedFoodEaten.value) {
      fermentedFoodEaten.value = true;
      await persistToDb();
    }
  }

  /**
   * Update daily tracking based on food instances logged today
   * Call this after food is added to weekly store
   */
  async function updateFromFoodInstances(
    foodInstances: Array<{
      color: FoodColor;
      isFermented: boolean;
      loggedDate: Date;
    }>
  ): Promise<void> {
    const currentDate = parseDateString(currentDateString.value);
    
    // Filter to today's instances
    const todayInstances = foodInstances.filter(instance =>
      isSameDay(instance.loggedDate, currentDate)
    );

    // Calculate colors from today's instances
    const dailyColors = calculateDailyColors(
      todayInstances.map(i => ({
        color: i.color,
        loggedDate: i.loggedDate,
      })),
      currentDate
    );

    // Update colors
    colorsEaten.value = dailyColors;

    // Check for fermented foods
    const hasFermented = todayInstances.some(i => i.isFermented);
    fermentedFoodEaten.value = hasFermented;

    await persistToDb();
  }

  /**
   * Manually reset daily data (for testing or manual reset)
   */
  async function resetDaily(): Promise<void> {
    waterGlasses.value = 0;
    colorsEaten.value = [];
    fermentedFoodEaten.value = false;
    await persistToDb();
  }

  /**
   * Set current date (for testing purposes)
   * @internal
   */
  function _setCurrentDate(date: Date): void {
    currentDateString.value = formatDateString(date);
  }

  /**
   * Get current date as Date object (helper for components)
   */
  function getCurrentDate(): Date {
    return parseDateString(currentDateString.value);
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Load today's data from IndexedDB
   */
  async function loadTodayData(): Promise<void> {
    const dateString = currentDateString.value;
    const data = await loadDailyData(userId.value, dateString);

    if (data) {
      waterGlasses.value = data.waterGlasses;
      colorsEaten.value = data.colorsEaten;
      fermentedFoodEaten.value = data.fermentedFoodEaten;
    } else {
      // Initialize empty day
      waterGlasses.value = 0;
      colorsEaten.value = [];
      fermentedFoodEaten.value = false;
    }
  }

  /**
   * Reset data for a new day
   */
  async function resetForNewDay(newDate: Date): Promise<void> {
    currentDateString.value = formatDateString(newDate);
    waterGlasses.value = 0;
    colorsEaten.value = [];
    fermentedFoodEaten.value = false;
    await persistToDb();
  }

  /**
   * Persist current state to IndexedDB
   */
  async function persistToDb(): Promise<void> {
    const dateString = currentDateString.value;
    
    const record: DailyDataRecord = {
      id: `${userId.value}-${dateString}`,
      userId: userId.value,
      date: dateString,
      waterGlasses: waterGlasses.value,
      colorsEaten: [...colorsEaten.value], // Convert to plain array
      fermentedFoodEaten: fermentedFoodEaten.value,
    };

    await saveDailyData(record);
  }

  /**
   * Format date as YYYY-MM-DD string
   */
  function formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse YYYY-MM-DD string to Date object
   */
  function parseDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    userId,
    currentDateString,
    waterGlasses,
    colorsEaten,
    fermentedFoodEaten,
    isInitialized,

    // Computed
    waterGoalAchieved,
    colorsCount,
    allColorsAchieved,

    // Constants (for UI)
    WATER_MIN,
    WATER_MAX,
    WATER_TARGET,

    // Actions
    initialize,
    checkForDayReset,
    incrementWater,
    decrementWater,
    setWaterGlasses,
    addColor,
    markFermentedFood,
    updateFromFoodInstances,
    resetDaily,
    getCurrentDate,
    _setCurrentDate, // For testing only
  };
});