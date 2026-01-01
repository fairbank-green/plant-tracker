// src/domain/streak.ts

export interface ArchivedWeek {
  weekStart: Date;
  weekEnd: Date;
  totalPoints: number;
  goalAchieved: boolean; // true if >= 30 points
}

/**
 * Calculate the current streak of consecutive weeks where the goal was achieved
 * 
 * Rules:
 * - Count consecutive weeks with goalAchieved === true
 * - Start from most recent week and work backwards
 * - Stop at first week with goalAchieved === false or gap in weeks
 * - Weeks must be sorted with most recent first
 * 
 * @param archivedWeeks - Array of archived weeks, sorted with most recent first
 * @returns Number of consecutive weeks where goal was achieved
 */
export function calculateStreak(archivedWeeks: ArchivedWeek[]): number {
  if (archivedWeeks.length === 0) {
    return 0;
  }

  let streak = 0;
  
  for (let i = 0; i < archivedWeeks.length; i++) {
    const week = archivedWeeks[i];
    
    // If goal not achieved, stop counting
    if (!week.goalAchieved) {
      break;
    }
    
    // If there's a gap between weeks, stop counting
    if (i > 0) {
      const currentWeek = week;
      const previousWeek = archivedWeeks[i - 1]; // More recent week (checked earlier)
      
      if (!areConsecutiveWeeks(previousWeek, currentWeek)) {
        break;
      }
    }
    
    streak++;
  }
  
  return streak;
}

/**
 * Check if two weeks are consecutive (one week apart)
 * @param recentWeek - The more recent week
 * @param olderWeek - The older week
 * @returns True if weeks are exactly one week apart
 */
function areConsecutiveWeeks(recentWeek: ArchivedWeek, olderWeek: ArchivedWeek): boolean {
  // Get Monday of each week for comparison
  const recentMonday = recentWeek.weekStart.getTime();
  const olderMonday = olderWeek.weekStart.getTime();
  
  // One week = 7 days = 7 * 24 * 60 * 60 * 1000 milliseconds
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  
  // Check if recent week is exactly one week after older week
  return (recentMonday - olderMonday) === oneWeekMs;
}

/**
 * Sort archived weeks with most recent first (for streak calculation)
 * @param weeks - Array of archived weeks
 * @returns New sorted array with most recent week first
 */
export function sortWeeksByMostRecent(weeks: ArchivedWeek[]): ArchivedWeek[] {
  return [...weeks].sort((a, b) => {
    return b.weekStart.getTime() - a.weekStart.getTime();
  });
}

/**
 * Check if a week achieved the goal (>= 30 points)
 * @param totalPoints - Total points for the week
 * @returns True if goal achieved
 */
export function didAchieveGoal(totalPoints: number): boolean {
  return totalPoints >= 30;
}