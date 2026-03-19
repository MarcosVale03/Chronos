"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventRecord } from "@/lib/events";

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

export function EventOverview({
  event,
  guestCount,
  attendingCount,
  pendingCount,
}: {
  event: EventRecord;
  guestCount: number;
  attendingCount: number;
  pendingCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>
          Core scheduling and planning details for this event.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Guests" value={String(guestCount)} />
          <MetricCard label="Attending" value={String(attendingCount)} />
          <MetricCard label="Pending" value={String(pendingCount)} />
          <MetricCard label="Capacity" value={event.guest_limit ? String(event.guest_limit) : "--"} />
        </div>
        <div className="rounded-2xl border bg-muted/30 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Event notes
          </h2>
          <p className="mt-3 text-sm leading-6 text-foreground/90">
            {event.description || "No description yet. Add notes from the edit screen to help guests understand the event."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
