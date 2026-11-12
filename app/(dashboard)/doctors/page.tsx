import type { Metadata } from "next";
import { DoctorsView } from "@/components/doctors/DoctorsView";

export const metadata: Metadata = { title: "Doctors" };

export default function DoctorsPage() {
  return <DoctorsView />;
}
