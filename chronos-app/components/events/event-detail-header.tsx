"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Pencil, Trash2 } from "lucide-react";

import { deleteEvent } from "@/app/protected/events/actions";
import { Button } from "@/components/ui/button";
import { EventRecord, formatDateRange } from "@/lib/events";

export function EventDetailHeader({ event }: { event: EventRecord }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
          Event details
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{event.title}</h1>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            <span>{formatDateRange(event.starts_at, event.ends_at)}</span>
          </div>
          {event.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span>{event.location}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/protected">Back to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/protected/events/${event.id}/edit`}>
            <Pencil />
            Edit event
          </Link>
        </Button>
        <form action={deleteEvent}>
          <input type="hidden" name="eventId" value={event.id} />
          <Button type="submit" variant="destructive">
            <Trash2 />
            Delete
          </Button>
        </form>
      </div>
    </div>
  );
}
