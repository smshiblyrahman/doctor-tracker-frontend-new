"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useRecentPatients } from "@/hooks/useDashboardStats";
import { formatRelative } from "@/lib/format";

export const RecentPatients = memo(function RecentPatients() {
  const { data, isPending: isLoading, error, refetch } = useRecentPatients(6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent patients</CardTitle>
        <CardDescription>Latest additions across all doctors</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/patients">
              View all <ArrowRight aria-hidden />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {error && !data ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : !data?.length ? (
          <EmptyState title="No patients yet" />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <caption className="sr-only">Recently added patients</caption>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden sm:table-cell">Condition</TableHead>
                  <TableHead className="hidden md:table-cell">Doctor</TableHead>
                  <TableHead className="text-right">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/patients/${p.id}`} className="font-medium hover:text-primary hover:underline">
                        {p.name}
                      </Link>
                      <span className="block text-xs text-muted-foreground">{p.age} yrs</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">{p.condition}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Link href={`/doctors/${p.doctor}`} className="text-muted-foreground hover:text-primary hover:underline">
                        {p.doctorName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap text-muted-foreground">{formatRelative(p.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
