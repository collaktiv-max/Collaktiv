import { PortalShell } from "@/components/portal/PortalShell";

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return <PortalShell>{children}</PortalShell>;
}
