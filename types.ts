export enum Platform {
  LeetCode = 'LeetCode',
}

export interface Goal {
  id: string;
  type: 'DAILY' | 'SHORT_TERM' | 'LONG_TERM';
  description: string;
  targetCount: number; // e.g., 3 problems (daily), 50 problems (short), 1 job (long)
  deadline?: string; // ISO Date string
  progress: number;
  unit: string; // 'problems', 'interview', 'rank'
}

export interface DailyLog {
  date: string; // ISO Date string YYYY-MM-DD
  solvedCount: number;
  platformBreakdown: Record<Platform, number>;
  missedTarget: boolean;
  reasonForMiss?: string;
  impactAnalysis?: ImpactAnalysis;
}

export interface ImpactAnalysis {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactDescription: string;
  adjustedPlan: string;
  motivationalMessage: string;
}

export interface UserState {
  dailyTarget: number;
  streak: number;
  totalSolved: number;
  goals: Goal[];
  logs: DailyLog[];
  lastSync: string;
}

export const INITIAL_STATE: UserState = {
  dailyTarget: 3,
  streak: 0,
  totalSolved: 0,
  lastSync: new Date().toISOString(),
  goals: [
    {
      id: '1',
      type: 'SHORT_TERM',
      description: 'Complete 75',
      targetCount: 75,
      progress: 0,
      deadline: '2024-12-31',
      unit: 'problems',
    },
    {
      id: '2',
      type: 'LONG_TERM',
      description: 'Master DSA for MAANG Interview',
      targetCount: 450, // Updated to represent problem count needed for mastery
      progress: 0,
      deadline: '2025-06-01',
      unit: 'problems',
    },
  ],
  logs: [], // No mock logs, waiting for API sync
};