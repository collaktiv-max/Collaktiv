import { LayoutGrid, Tag, Megaphone, UserRound } from "lucide-react";

export const navItems = [
  { href: "/portal", label: "Översikt", icon: LayoutGrid, exact: true },
  { href: "/portal/erbjudanden", label: "Erbjudanden", icon: Tag },
  { href: "/portal/marknadsforing", label: "Marknadsföring", icon: Megaphone },
  { href: "/portal/profil", label: "Profil", icon: UserRound },
] as const;
