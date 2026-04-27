export interface CommunityStat {
  id: string;
  exerciseId: string;
  value: number;
  change24h: number;
}

export const COMMUNITY_TODAY: CommunityStat[] = [
  { id: "c-pushups", exerciseId: "pushups", value: 48_230, change24h: 8 },
  { id: "c-pullups", exerciseId: "pullups", value: 12_940, change24h: 5 },
  { id: "c-squats", exerciseId: "squats", value: 94_300, change24h: 12 },
  { id: "c-plank", exerciseId: "plank", value: 18_500, change24h: 4 },
  { id: "c-walking", exerciseId: "walking", value: 38_120, change24h: 9 },
  { id: "c-running", exerciseId: "running", value: 14_870, change24h: 11 },
  { id: "c-burpees", exerciseId: "burpees", value: 9_640, change24h: 14 },
];

export const COMMUNITY_TOTAL_TODAY = 236_600;

/** Total Energy Score earned by the entire community today. */
export const COMMUNITY_ENERGY_TODAY = 4_124_000;
