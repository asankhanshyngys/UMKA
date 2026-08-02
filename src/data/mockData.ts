import type { Course, SubscriptionPlan, Topic } from "@/types/course";

export const currency = "₸";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "sub-1m",
    durationMonths: 1,
    price: 9990,
    label: "1 месяц",
    description: "Полный доступ ко всем видеоурокам на 30 дней",
  },
  {
    id: "sub-3m",
    durationMonths: 3,
    price: 24990,
    label: "3 месяца",
    description: "Полный доступ ко всем видеоурокам на 90 дней",
    popular: true,
  },
  {
    id: "sub-6m",
    durationMonths: 6,
    price: 44990,
    label: "6 месяцев",
    description: "Полный доступ ко всем видеоурокам на 180 дней",
  },
];

export const course: Course = {
  id: "umka-english",
  title: "Английский язык",
  description:
    "Структурированный курс английского от базового уровня до уверенного общения. Грамматика, лексика, произношение и практика — всё в одном месте.",
  topics: [
    {
      id: "grammar-basics",
      title: "Основы грамматики",
      description:
        "Артикли, порядок слов, базовые конструкции предложений и фундаментальные правила.",
      thumbnailColor: "forest",
      price: 4990,
      videos: [
        { id: "gb-1", title: "Артикли a / an / the", duration: "18 мин", price: 1990, status: "current" },
        { id: "gb-2", title: "Порядок слов в предложении", duration: "22 мин", price: 1990, status: "locked" },
        { id: "gb-3", title: "Множественное число", duration: "15 мин", price: 1990, status: "locked" },
      ],
    },
    {
      id: "verb-tenses",
      title: "Времена глаголов",
      description:
        "Present, Past и Future — все основные времена с примерами и упражнениями.",
      thumbnailColor: "mustard",
      price: 5990,
      videos: [
        { id: "vt-1", title: "Present Simple", duration: "25 мин", price: 1990, status: "locked" },
        { id: "vt-2", title: "Present Continuous", duration: "20 мин", price: 1990, status: "locked" },
        { id: "vt-3", title: "Past Simple", duration: "28 мин", price: 1990, status: "locked" },
        { id: "vt-4", title: "Future forms", duration: "24 мин", price: 1990, status: "locked" },
      ],
    },
    {
      id: "speaking",
      title: "Разговорная речь",
      description:
        "Диалоги, фразы для повседневного общения и уверенность в разговоре.",
      thumbnailColor: "sage",
      price: 5490,
      videos: [
        { id: "sp-1", title: "Знакомство и small talk", duration: "20 мин", price: 1990, status: "locked" },
        { id: "sp-2", title: "В ресторане и в магазине", duration: "18 мин", price: 1990, status: "locked" },
        { id: "sp-3", title: "Телефонный разговор", duration: "16 мин", price: 1990, status: "locked" },
      ],
    },
    {
      id: "vocabulary",
      title: "Словарный запас",
      description:
        "Тематическая лексика, фразовые глаголы и техники запоминания слов.",
      thumbnailColor: "mustard",
      price: 4990,
      videos: [
        { id: "vc-1", title: "100 частых слов", duration: "30 мин", price: 1990, status: "locked" },
        { id: "vc-2", title: "Фразовые глаголы", duration: "26 мин", price: 1990, status: "locked" },
        { id: "vc-3", title: "Словарь для путешествий", duration: "22 мин", price: 1990, status: "locked" },
      ],
    },
    {
      id: "listening",
      title: "Аудирование",
      description:
        "Тренировка восприятия речи на слух с аутентичными материалами.",
      thumbnailColor: "forest",
      price: 4990,
      videos: [
        { id: "ls-1", title: "Понимание медленной речи", duration: "20 мин", price: 1990, status: "locked" },
        { id: "ls-2", title: "Подкасты для начинающих", duration: "24 мин", price: 1990, status: "locked" },
      ],
    },
    {
      id: "pronunciation",
      title: "Произношение",
      description:
        "Звуки, ударения и интонация — говорите понятно и естественно.",
      thumbnailColor: "sage",
      price: 4490,
      videos: [
        { id: "pr-1", title: "Английские звуки", duration: "22 мин", price: 1990, status: "locked" },
        { id: "pr-2", title: "Связная речь", duration: "18 мин", price: 1990, status: "locked" },
        { id: "pr-3", title: "Интонация в вопросах", duration: "15 мин", price: 1990, status: "locked" },
      ],
    },
  ],
};

export const topics: Topic[] = course.topics;

export function getTopicById(id: string): Topic | undefined {
  return course.topics.find((topic) => topic.id === id);
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} ${currency}`;
}
