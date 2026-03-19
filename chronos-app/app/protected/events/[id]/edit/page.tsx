import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, PencilLine } from "lucide-react";

import { updateEvent } from "@/app/protected/events/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EventRecord, formatDateTimeInput } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

const errorMessages: Record<string, string> = {
  "invalid-date-range": "End time must be after the start time.",
  "invalid-guest-limit": "Guest limit must be zero or greater.",
  "missing-fields": "Title and start time are required.",
  "save-failed": "The event could not be updated. Try again.",
};

async function getEventForEdit(eventId: string) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    redirect("/auth/login");
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, description, location, starts_at, ends_at, guest_limit")
    .eq("id", eventId)
    .eq("user_id", authData.claims.sub)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  return event as EventRecord;
}

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const event = await getEventForEdit(id);
  const updateEventAction = updateEvent.bind(null, event.id);
  const message = error ? errorMessages[error] : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            Event editor
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit {event.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update the schedule, venue, notes, or planning capacity for this event.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/protected/events/${event.id}`}>
            <ChevronLeft />
            Back to event
          </Link>
        </Button>
      </div>

      <Card className="border-0 bg-white/85 shadow-xl shadow-slate-200/70 backdrop-blur dark:bg-slate-950/70 dark:shadow-black/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <PencilLine className="size-5" />
            </div>
            <div>
              <CardTitle>Event details</CardTitle>
              <CardDescription>
                Changes save directly back to your Supabase project.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
              {message}
            </div>
          ) : null}

          <form action={updateEventAction} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Event title</Label>
              <Input id="title" name="title" defaultValue={event.title} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={event.description ?? ""}
                className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startsAt">Start</Label>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeInput(event.starts_at)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endsAt">End</Label>
                <Input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  defaultValue={formatDateTimeInput(event.ends_at)}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={event.location ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guestLimit">Guest limit</Label>
                <Input
                  id="guestLimit"
                  name="guestLimit"
                  type="number"
                  min="0"
                  defaultValue={event.guest_limit ?? ""}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Event guests and RSVP tracking stay attached automatically when you update event details.
              </p>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href={`/protected/events/${event.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}