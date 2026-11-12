import type { Metadata } from "next";
import { PatientDetailView } from "@/components/patients/PatientDetailView";

export const metadata: Metadata = { title: "Patient" };

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientDetailView id={id} />;
}
