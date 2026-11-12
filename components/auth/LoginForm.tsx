"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { safeNextPath, useLogin } from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/lib/validators/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => {
        router.replace(safeNextPath(searchParams.get("next")));
        router.refresh();
      },
    }),
  );

  const serverError =
    login.error instanceof ApiError
      ? login.error.message
      : login.error
        ? "Could not sign in. Please try again."
        : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to the administrator portal.</p>
      </div>

      {serverError && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {serverError}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="admin@doctortracker.dev"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Loader2 className="animate-spin" aria-hidden />}
        Sign in
      </Button>

      <div className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground space-y-1">
        <p>
          Admin: <span className="font-mono font-medium text-foreground">admin@doctortracker.dev</span> / <span className="font-mono font-medium text-foreground">Admin@12345</span>
        </p>
        <p>
          Patient: <span className="font-mono font-medium text-foreground">patient@doctortracker.dev</span> / <span className="font-mono font-medium text-foreground">Patient@12345</span>
        </p>
      </div>
    </form>
  );
}
