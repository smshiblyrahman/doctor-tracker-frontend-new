import type { Metadata } from "next";
import { DoctorDetailView } from "@/components/doctors/DoctorDetailView";

export const metadata: Metadata = { title: "Doctor" };

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // No <Suspense> here: these routes are dynamic (the layout reads cookies), and a
  // boundary would hydrate after the header, whose breadcrumb shares this page's
  // doctor query. Data arriving in between causes a hydration mismatch.
  return <DoctorDetailView id={id} />;
}
