import {
  Library,
  CreditCard,
  Users,
  Activity,
  Settings,
} from "lucide-react";

export const MENU_ITEMS = [
  {
    title: "Library",
    href: "",
    icon: Library,
  },
  {
    title: "Activity",
    href: "/activity",
    icon: Activity,
  },
  {
    title: "Members",
    href: "/members",
    icon: Users,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;

import { PLAN_LIMITS } from "@/shared/planLimits";

export { PLAN_LIMITS };
export type Plan = keyof typeof PLAN_LIMITS;
