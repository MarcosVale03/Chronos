"use client";

import { Clock3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock3 className="size-4 text-indigo-600" />
        <span>{label}</span>
      </div>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

export function EventRsvpSummary({
  attending,
  maybe,
  pending,
  declined,
}: {
  attending: number;
  maybe: number;
  pending: number;
  declined: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>RSVP Summary</CardTitle>
        <CardDescription>
          Track how your guest list is shaping up.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <StatusRow label="Attending" value={attending} />
        <StatusRow label="Maybe" value={maybe} />
        <StatusRow label="Pending" value={pending} />
        <StatusRow label="Declined" value={declined} />
      </CardContent>
    </Card>
  );
}
