import {
  Library,
  CreditCard,
  Users,
  Activity,
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
] as const;
