import {
  Library,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react";

export const MENU_ITEMS = [
  {
    title: "My Library",
    href: "",
    icon: Library,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
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
