import { notFound, redirect } from "next/navigation";

import { EventDetailHeader } from "@/components/events/event-detail-header";
import { EventAddGuestForm } from "@/components/events/event-add-guest-form";
import { EventGuestList } from "@/components/events/event-guest-list";
import { EventOverview } from "@/components/events/event-overview";
import { EventRsvpSummary } from "@/components/events/event-rsvp-summary";
import { eventErrorMessages } from "@/lib/events-validation";
import { EventGuestRecord, EventRecord } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

async function getEventPageData(eventId: string) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims?.sub) {
    redirect("/auth/login");
  }

  const userId = authData.claims.sub;
  const [{ data: event, error: eventError }, { data: guests, error: guestError }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, description, location, starts_at, ends_at, guest_limit")
      .eq("id", eventId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("event_guests")
      .select("id, event_id, full_name, email, phone, rsvp_status, notes")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  if (eventError || !event) {
    notFound();
  }

  return {
    event: event as EventRecord,
    guests: (guests ?? []) as EventGuestRecord[],
    guestError,
  };
}

export default async function EventDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const { event, guests, guestError } = await getEventPageData(id);
  const message = error ? eventErrorMessages[error] : null;
  const attendingCount = guests.filter((guest) => guest.rsvp_status === "yes").length;
  const maybeCount = guests.filter((guest) => guest.rsvp_status === "maybe").length;
  const pendingCount = guests.filter((guest) => guest.rsvp_status === "pending").length;
  const declinedCount = guests.filter((guest) => guest.rsvp_status === "no").length;

  return (
    <div className="flex flex-col gap-8">
      <EventDetailHeader event={event} />

      {message ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <EventOverview
          event={event}
          guestCount={guests.length}
          attendingCount={attendingCount}
          pendingCount={pendingCount}
        />
        <EventRsvpSummary
          attending={attendingCount}
          maybe={maybeCount}
          pending={pendingCount}
          declined={declinedCount}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <EventGuestList eventId={event.id} guests={guests} error={!!guestError} />
        <EventAddGuestForm eventId={event.id} />
      </div>
    </div>
  );
}