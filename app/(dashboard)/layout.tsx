import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/** App shell modelled on shadcn's dashboard-01: inset sidebar + sticky header + content. */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Restore the collapsed/expanded state server-side to avoid a layout jump.
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
      </SidebarInset>
      <CommandMenu />
    </SidebarProvider>
  );
}
