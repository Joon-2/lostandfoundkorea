import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link / useRouter / usePathname / redirect.
// Use these in customer-facing components instead of next/link so
// that internal navigation preserves the current locale.
export const { Link, useRouter, usePathname, redirect } =
  createNavigation(routing);
