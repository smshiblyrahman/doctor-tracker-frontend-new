"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { CommandMenuTrigger } from "./CommandMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:rounded-t-xl lg:px-6">
      <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>
      <CommandMenuTrigger />
      <ThemeToggle />
    </header>
  );
}
