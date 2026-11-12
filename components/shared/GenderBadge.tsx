import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/format";
import type { Gender } from "@/lib/types";

export const GenderBadge = memo(function GenderBadge({ gender }: { gender: Gender }) {
  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      {capitalize(gender)}
    </Badge>
  );
});
