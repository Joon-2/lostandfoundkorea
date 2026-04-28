"use client";

import { useTranslations } from "next-intl";

// FAQ content lives in /locales/<locale>.json under faq.categories.
// This hook reads the localized array via t.raw('categories'); FaqClient
// then renders questions/answers and handles search/expand state.
//
// Answer values are plain strings with three formatting conventions
// (rendered by <FaqAnswer> in FaqClient.tsx):
//   - "\n\n"           paragraph break
//   - "\n• " prefix    bullet list item
//   - "**bold**"       inline bold
//   - "[text](url)"    inline link

export type FaqQuestion = {
  id: string;
  q: string;
  a: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  description: string;
  questions: FaqQuestion[];
};

export function useFaqCategories(): FaqCategory[] {
  const t = useTranslations("faq");
  return t.raw("categories") as FaqCategory[];
}
