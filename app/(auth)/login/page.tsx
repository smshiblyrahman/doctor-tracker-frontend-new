import type { Metadata } from "next";
import { Suspense } from "react";
import { Activity, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

const HIGHLIGHTS = [
  { icon: Stethoscope, text: "Doctor and patient records in one place" },
  { icon: Activity, text: "Live analytics on registrations and workloads" },
  { icon: ShieldCheck, text: "httpOnly session cookies with token rotation" },
];

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="size-4" aria-hidden />
          </span>
          Doctor Tracker
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-end lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]"
        />
        <div className="relative space-y-6 text-primary-foreground">
          <h2 className="max-w-md text-3xl font-semibold tracking-tight text-balance">
            Run your clinic’s roster with clarity.
          </h2>
          <ul className="space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-primary-foreground/90">
                <span className="flex size-8 items-center justify-center rounded-md bg-white/15">
                  <Icon className="size-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
