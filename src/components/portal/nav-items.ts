import { LayoutGrid, Tag, LayoutTemplate, Trophy, UserPlus, UserRound } from "lucide-react";

// bottomBar: false utelämnar punkten ur den smala mobila bottom-tab-
// baren (plats för bara ~5 korta etiketter innan de krockar, se
// PortalShell.tsx) – den syns ändå i den vanliga sidomenyn/mobilmenyn.
// Marknadsföring är inte lanserad än ("Snart") och behöver inte den
// mest åtkomliga platsen.
export const navItems = [
  { href: "/portal", label: "Översikt", icon: LayoutGrid, exact: true },
  { href: "/portal/erbjudanden", label: "Erbjudanden", icon: Tag },
  {
    href: "/portal/marknadsforing",
    label: "Marknadsföring",
    icon: LayoutTemplate,
    comingSoon: true,
    bottomBar: false,
  },
  { href: "/portal/tavlingspartner", label: "Tävlingspartner", icon: Trophy },
  { href: "/portal/bjud-in", label: "Bjud in företag", icon: UserPlus },
  { href: "/portal/profil", label: "Profil", icon: UserRound },
] as const;
