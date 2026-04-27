export interface Testimonial {
  id: string;
  name: string;
  handle: string;
  textRu: string;
  textEn: string;
  metricRu: string;
  metricEn: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Maria Lin",
    handle: "@marialn",
    textRu:
      "Серия в 41 день. Никогда так не возвращалась к спорту. Отжимания за минуту до сна — и день засчитан.",
    textEn:
      "41-day streak. I've never come back to sport like this. A minute of push-ups before bed and the day counts.",
    metricRu: "41 день серии",
    metricEn: "41-day streak",
  },
  {
    id: "t-2",
    name: "Karim O.",
    handle: "@karimo",
    textRu:
      "Дуэль 1-на-1 с другом в обед — лучшее, что случилось с моей дисциплиной. И ты такой: ах, я ему проиграю?!",
    textEn:
      "Lunch-time 1-on-1 duels with a friend — best thing for my discipline. You're like: nope, not losing this.",
    metricRu: "+312% к активности",
    metricEn: "+312% activity",
  },
  {
    id: "t-3",
    name: "Anya Krym",
    handle: "@anyak",
    textRu:
      "Три минуты в день — и я в топ-50. Это даже не приложение, это игра в дисциплину.",
    textEn:
      "Three minutes a day and I'm in the top-50. This isn't an app, it's a discipline game.",
    metricRu: "топ-50 глобально",
    metricEn: "top-50 global",
  },
  {
    id: "t-4",
    name: "Lev Bar",
    handle: "@levb",
    textRu:
      "У меня в команде 12 человек. Корпоративный челлендж по приседаниям — теперь все ноют, но не пропускают.",
    textEn:
      "Team of 12. Corporate squat challenge — everyone moans but no one skips a day.",
    metricRu: "12 в команде",
    metricEn: "team of 12",
  },
  {
    id: "t-5",
    name: "Polina F.",
    handle: "@polinaf",
    textRu:
      "Heatmap зелёная два месяца. Серьёзно — это самый красивый трекер привычек, который я видела.",
    textEn:
      "Heatmap is green for two months. Seriously, the prettiest habit tracker I've seen.",
    metricRu: "60 дней без пропусков",
    metricEn: "60 days no skip",
  },
  {
    id: "t-6",
    name: "Igor R.",
    handle: "@igorr",
    textRu:
      "До FitStreak я думал, что мне нужен зал. Оказалось — мне нужны два пуша на телефоне в день.",
    textEn:
      "Before FitStreak I thought I needed a gym. Turns out I needed two phone nudges a day.",
    metricRu: "33 дня серии",
    metricEn: "33-day streak",
  },
];
