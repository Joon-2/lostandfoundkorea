import type { FacilityCategory } from "@/types/facility";

export type CategoryDef = {
  key: FacilityCategory;
  label: string;
  emoji: string;
  description: string;
};

export const CATEGORIES: CategoryDef[] = [
  {
    key: "airports",
    label: "Airports",
    emoji: "✈️",
    description: "Lost & found desks at Incheon, Gimpo, and other Korean airports.",
  },
  {
    key: "subway",
    label: "Subway",
    emoji: "🚇",
    description: "Seoul Metro, Busan Metro, and other urban rail lost & found centers.",
  },
  {
    key: "trains",
    label: "Trains",
    emoji: "🚆",
    description: "KTX, Korail, and intercity train lost item services.",
  },
  {
    key: "buses",
    label: "Buses",
    emoji: "🚌",
    description: "City and intercity bus operators handling lost belongings.",
  },
  {
    key: "taxis",
    label: "Taxis",
    emoji: "🚕",
    description: "Kakao T, T-money, and Seoul taxi dispatch lines for lost items.",
  },
  {
    key: "hotels",
    label: "Hotels",
    emoji: "🏨",
    description: "Major hotel chains with English-speaking lost & found support.",
  },
  {
    key: "shopping",
    label: "Shopping",
    emoji: "🛍️",
    description: "Department stores, malls, and markets across Korea.",
  },
  {
    key: "attractions",
    label: "Attractions",
    emoji: "🗺️",
    description: "Palaces, museums, and tourist sites with information desks.",
  },
  {
    key: "police",
    label: "Police",
    emoji: "🚓",
    description: "Lost112 and local police stations that accept turn-ins.",
  },
  {
    key: "restaurants",
    label: "Restaurants",
    emoji: "🍽️",
    description: "Restaurant chains and cafes with consistent lost & found policies.",
  },
];

export const CATEGORY_BY_KEY: Record<FacilityCategory, CategoryDef> =
  CATEGORIES.reduce((acc, c) => {
    acc[c.key] = c;
    return acc;
  }, {} as Record<FacilityCategory, CategoryDef>);

export function getCategoryDef(key: string): CategoryDef | undefined {
  return CATEGORY_BY_KEY[key as FacilityCategory];
}
