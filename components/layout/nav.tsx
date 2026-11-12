import { LayoutDashboard, Stethoscope, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Clinic analytics" },
  { title: "Doctors", href: "/doctors", icon: Stethoscope, description: "Manage doctors and their patients" },
  { title: "Patients", href: "/patients", icon: Users, description: "All patients across doctors" },
];

export const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
