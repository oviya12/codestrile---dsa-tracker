import { Platform, DailyLog } from '../types';

interface LeetCodeStats {
  totalSolved: number;
  solvedToday: number;
  logs: DailyLog[];
}

/**
 * Helper to format a Date object to YYYY-MM-DD string
 */
const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Fetches LeetCode stats using a community proxy API.
 * Parses the submission calendar to find problems solved today and generate history logs.
 */
const fetchLeetCodeStats = async (username: string): Promise<LeetCodeStats> => {
  if (!username) return { totalSolved: 0, solvedToday: 0, logs: [] };
  try {
    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
    
    if (!response.ok) {
        console.warn(`LeetCode API request failed: ${response.status}`);
        return { totalSolved: 0, solvedToday: 0, logs: [] };
    }

    const data = await response.json();
    
    if (data && data.status === 'success') {
      const totalSolved = data.totalSolved || 0;
      let calendar = data.submissionCalendar;

      // Handle stringified JSON response
      if (typeof calendar === 'string') {
          try {
              calendar = JSON.parse(calendar);
          } catch (e) {
              console.error("Error parsing submissionCalendar string:", e);
              calendar = {};
          }
      }

      if (!calendar || typeof calendar !== 'object') {
          return { totalSolved, solvedToday: 0, logs: [] };
      }

      // Process Calendar into Daily Logs
      const logsMap: Record<string, number> = {};
      let solvedToday = 0;
      
      const now = new Date();
      // Normalize "today" to start of day for comparison
      const todayKey = formatDateKey(now);

      for (const [timestampStr, count] of Object.entries(calendar)) {
          const timestamp = Number(timestampStr);
          const date = new Date(timestamp * 1000);
          const dateKey = formatDateKey(date);
          
          logsMap[dateKey] = (logsMap[dateKey] || 0) + Number(count);
      }

      // Extract today's count
      solvedToday = logsMap[todayKey] || 0;

      // Convert map to sorted array of DailyLog
      // We'll take the last 30 days for the chart/consistency tracking
      const logs: DailyLog[] = Object.entries(logsMap)
        .map(([date, count]) => ({
            date,
            solvedCount: count,
            platformBreakdown: { [Platform.LeetCode]: count },
            missedTarget: false // This logic is usually calculated based on target, handled in App
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return { totalSolved, solvedToday, logs };
    }
    
    console.warn('LeetCode API returned error:', data?.message);
    return { totalSolved: 0, solvedToday: 0, logs: [] };
  } catch (error) {
    console.error('Failed to fetch LeetCode stats:', error);
    return { totalSolved: 0, solvedToday: 0, logs: [] };
  }
};

export const syncPlatformData = async (
  usernames: Record<Platform, string>
): Promise<Record<Platform, LeetCodeStats>> => {
  const leetStats = await fetchLeetCodeStats(usernames[Platform.LeetCode]);
  return {
    [Platform.LeetCode]: leetStats,
  };
};