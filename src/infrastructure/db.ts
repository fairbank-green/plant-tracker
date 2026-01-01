// src/infrastructure/db.ts
import { openDB, type IDBPDatabase } from 'idb';
import type { FoodCategory, FoodColor } from '../domain/types.js';

// Database configuration
const DB_NAME = 'plant-tracker-db';
const DB_VERSION = 1;

// Store names
const WEEKLY_STORE = 'weeklyData';
const DAILY_STORE = 'dailyData';

// ============================================================================
// Type Definitions
// ============================================================================

export interface WeeklyFoodInstanceRecord {
  instanceId: string;
  foodId: string;
  foodName: string;
  category: FoodCategory;
  color: FoodColor;
  isFermented: boolean;
  loggedDate: string; // ISO string for storage
  pointValue: number;
  firstLoggedDate: string; // ISO string for storage
}

export interface WeeklyDataRecord {
  id: string; // Primary key: userId
  userId: string;
  weekStart: string; // ISO string
  weekEnd: string; // ISO string
  foodInstances: WeeklyFoodInstanceRecord[];
  uniqueFoods: string[];
  totalPoints: number;
  categoryBreakdown: {
    whole_grains: number;
    nuts_seeds: number;
    fruits: number;
    vegetables: number;
    legumes: number;
    herbs_spices: number;
  };
  colorsAchieved: FoodColor[];
  currentStreak: number;
}

export interface DailyDataRecord {
  id: string; // Primary key: userId-date (e.g., "user123-2025-01-06")
  userId: string;
  date: string; // ISO string
  waterGlasses: number;
  colorsEaten: FoodColor[];
  fermentedFoodEaten: boolean;
}

// ============================================================================
// Database Initialization
// ============================================================================

let dbInstance: IDBPDatabase | null = null;

/**
 * Initialize and open the IndexedDB database
 * Creates object stores if they don't exist
 */
async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Create weekly data store
      if (!db.objectStoreNames.contains(WEEKLY_STORE)) {
        const weeklyStore = db.createObjectStore(WEEKLY_STORE, {
          keyPath: 'id',
        });
        weeklyStore.createIndex('userId', 'userId', { unique: false });
      }

      // Create daily data store
      if (!db.objectStoreNames.contains(DAILY_STORE)) {
        const dailyStore = db.createObjectStore(DAILY_STORE, {
          keyPath: 'id',
        });
        dailyStore.createIndex('userId', 'userId', { unique: false });
        dailyStore.createIndex('date', 'date', { unique: false });
      }
    },
  });

  return dbInstance;
}

// ============================================================================
// Weekly Data Operations
// ============================================================================

/**
 * Save weekly tracking data to IndexedDB
 * @param data - Weekly data record to save
 */
export async function saveWeeklyData(data: WeeklyDataRecord): Promise<void> {
  const db = await getDB();
  await db.put(WEEKLY_STORE, data);
}

/**
 * Load weekly tracking data from IndexedDB
 * @param userId - User ID to load data for
 * @returns Weekly data record or null if not found
 */
export async function loadWeeklyData(
  userId: string
): Promise<WeeklyDataRecord | null> {
  const db = await getDB();
  const data = await db.get(WEEKLY_STORE, userId);
  return data || null;
}

/**
 * Delete weekly tracking data from IndexedDB
 * @param userId - User ID to delete data for
 */
export async function deleteWeeklyData(userId: string): Promise<void> {
  const db = await getDB();
  await db.delete(WEEKLY_STORE, userId);
}

// ============================================================================
// Daily Data Operations
// ============================================================================

/**
 * Save daily tracking data to IndexedDB
 * @param data - Daily data record to save
 */
export async function saveDailyData(data: DailyDataRecord): Promise<void> {
  const db = await getDB();
  await db.put(DAILY_STORE, data);
}

/**
 * Load daily tracking data from IndexedDB
 * @param userId - User ID to load data for
 * @param date - Date string (YYYY-MM-DD format)
 * @returns Daily data record or null if not found
 */
export async function loadDailyData(
  userId: string,
  date: string
): Promise<DailyDataRecord | null> {
  const db = await getDB();
  const id = `${userId}-${date}`;
  const data = await db.get(DAILY_STORE, id);
  return data || null;
}

/**
 * Delete daily tracking data from IndexedDB
 * @param userId - User ID
 * @param date - Date string (YYYY-MM-DD format)
 */
export async function deleteDailyData(
  userId: string,
  date: string
): Promise<void> {
  const db = await getDB();
  const id = `${userId}-${date}`;
  await db.delete(DAILY_STORE, id);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear all data from the database (useful for testing)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([WEEKLY_STORE, DAILY_STORE], 'readwrite');
  await Promise.all([
    tx.objectStore(WEEKLY_STORE).clear(),
    tx.objectStore(DAILY_STORE).clear(),
    tx.done,
  ]);
}

/**
 * Close the database connection
 */
export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Delete the entire database (useful for testing)
 */
export async function deleteDatabase(): Promise<void> {
  await closeDB();
  if (typeof indexedDB !== 'undefined') {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Database deletion blocked'));
    });
  }
}