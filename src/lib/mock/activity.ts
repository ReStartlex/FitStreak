export interface ActivityRecord {
  id: string;
  exerciseId: string;
  amount: number;
  at: string;
  dayLabelRu: string;
  dayLabelEn: string;
}

/**
 * Today's activity log for the mock user.
 * Sum of Energy Score ≈ 286, sum of XP ≈ 412 (matches mock user fields).
 *  20 push-ups   -> ES 10  / XP 20
 *  60 sec plank  -> ES 3   / XP 8
 *  30 squats     -> ES 6   / XP 15
 *  25 push-ups   -> ES 13  / XP 25
 *  40 abs        -> ES 8   / XP 24
 *  3.2 km walk   -> ES 160 / XP 128
 *  10 burpees    -> ES 12  / XP 18
 *  5 pull-ups    -> ES 6   / XP 10
 */
export const TODAY_ACTIVITY: ActivityRecord[] = [
  { id: "a-1", exerciseId: "pushups", amount: 20, at: "08:14", dayLabelRu: "Сегодня", dayLabelEn: "Today" },
  { id: "a-2", exerciseId: "plank", amount: 60, at: "08:21", dayLabelRu: "Сегодня", dayLabelEn: "Today" },
  { id: "a-3", exerciseId: "walking", amount: 3.2, at: "10:42", dayLabelRu: "Сегодня", dayLabelEn: "Today" },
  { id: "a-4", exerciseId: "squats", amount: 30, at: "13:02", dayLabelRu: "Сегодня", dayLabelEn: "Today" },
  { id: "a-5", exerciseId: "pushups", amount: 25, at: "18:40", dayLabelRu: "Сегодня", dayLabelEn: "Today" },
  { id: "a-6", exerciseId: "burpees", amount: 10, at: "18:52", dayLabelRu: "Сегодня", dayLabelEn: "Today" },
  { id: "a-7", exerciseId: "pullups", amount: 5, at: "18:58", dayLabelRu: "Сегодня", dayLabelEn: "Today" },
  { id: "a-8", exerciseId: "abs", amount: 40, at: "19:05", dayLabelRu: "Сегодня", dayLabelEn: "Today" },
];

export const WEEK_ACTIVITY: ActivityRecord[] = [
  { id: "b-1", exerciseId: "pushups", amount: 60, at: "Вс", dayLabelRu: "Воскресенье", dayLabelEn: "Sunday" },
  { id: "b-2", exerciseId: "running", amount: 4, at: "Вс", dayLabelRu: "Воскресенье", dayLabelEn: "Sunday" },
  { id: "b-3", exerciseId: "squats", amount: 80, at: "Сб", dayLabelRu: "Суббота", dayLabelEn: "Saturday" },
  { id: "b-4", exerciseId: "plank", amount: 180, at: "Пт", dayLabelRu: "Пятница", dayLabelEn: "Friday" },
  { id: "b-5", exerciseId: "pullups", amount: 12, at: "Чт", dayLabelRu: "Четверг", dayLabelEn: "Thursday" },
  { id: "b-6", exerciseId: "walking", amount: 5, at: "Чт", dayLabelRu: "Четверг", dayLabelEn: "Thursday" },
  { id: "b-7", exerciseId: "pushups", amount: 70, at: "Ср", dayLabelRu: "Среда", dayLabelEn: "Wednesday" },
  { id: "b-8", exerciseId: "burpees", amount: 15, at: "Вт", dayLabelRu: "Вторник", dayLabelEn: "Tuesday" },
];

export function buildHeatmap(weeks = 12) {
  const days = weeks * 7;
  const cells: { date: string; level: 0 | 1 | 2 | 3 | 4 }[] = [];
  let seed = 42;
  const rand = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  for (let i = 0; i < days; i++) {
    const r = rand();
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (r > 0.85) level = 4;
    else if (r > 0.65) level = 3;
    else if (r > 0.45) level = 2;
    else if (r > 0.25) level = 1;
    if (i > days - 18 && level === 0) level = 1;
    if (i > days - 8) level = Math.max(2, level) as 0 | 1 | 2 | 3 | 4;
    cells.push({ date: `d-${i}`, level });
  }
  return cells;
}
