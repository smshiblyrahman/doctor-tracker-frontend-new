"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctor } from "@/hooks/useDoctors";
import { usePatient } from "@/hooks/usePatients";
import { NAV_ITEMS } from "./nav";

/** Shares the page's query (same key), so resolving the name costs no extra request. */
function EntityName({ section, id }: { section: string; id: string }) {
  const doctor = useDoctorName(section === "doctors" ? id : undefined);
  const patient = usePatientName(section === "patients" ? id : undefined);
  const name = doctor ?? patient;
  return name === undefined ? <Skeleton className="h-4 w-28" /> : <>{name}</>;
}

function useDoctorName(id?: string) {
  const query = useDoctor(id ?? "");
  return id ? (query.data?.name ?? (query.isError ? "Not found" : undefined)) : undefined;
}

function usePatientName(id?: string) {
  const query = usePatient(id ?? "");
  return id ? (query.data?.name ?? (query.isError ? "Not found" : undefined)) : undefined;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const [section, id] = pathname.split("/").filter(Boolean);
  const nav = NAV_ITEMS.find((item) => item.href === `/${section}`);
  if (!nav) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {id ? (
          <Fragment>
            <BreadcrumbItem className="hidden sm:block">
              <BreadcrumbLink asChild>
                <Link href={nav.href}>{nav.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-48 truncate">
                <EntityName section={section} id={id} />
              </BreadcrumbPage>
            </BreadcrumbItem>
          </Fragment>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>{nav.title}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
