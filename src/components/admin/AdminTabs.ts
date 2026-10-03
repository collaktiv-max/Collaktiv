import {
  Building2,
  ClipboardCheck,
  Gift,
  LayoutGrid,
  Rocket,
  Ticket,
  type LucideIcon,
} from "lucide-react";

export type AdminTab =
  | "oversikt"
  | "ansokningar"
  | "erbjudanden"
  | "kampanjer"
  | "tavlingsvardar"
  | "foretag";

export const ADMIN_TABS: { id: AdminTab; label: string; icon: LucideIcon }[] = [
  { id: "oversikt", label: "Översikt", icon: LayoutGrid },
  { id: "ansokningar", label: "Ansökningar", icon: ClipboardCheck },
  { id: "erbjudanden", label: "Erbjudanden", icon: Ticket },
  { id: "kampanjer", label: "Kampanjer", icon: Rocket },
  { id: "tavlingsvardar", label: "Tävlingsvärdar", icon: Gift },
  { id: "foretag", label: "Alla företag", icon: Building2 },
];
