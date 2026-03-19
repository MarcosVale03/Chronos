import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock3, MapPin, Plus, Users } from "lucide-react";
import Link from "next/link";
import {
  EventGuestRecord,
  EventRecord,
  buildCalendarDays,
  formatDateRange,
} from "@/lib/events";

async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");
  return data.claims;
}

async function getEvents(userId: string) {
  const supabase = await createClient();
  const [{ data: eventData, error: eventError }, { data: guestData, error: guestError }] =
    await Promise.all([
      supabase
        .from("events")
        .select("id, title, description, location, starts_at, ends_at, guest_limit")
        .eq("user_id", userId)
        .order("starts_at", { ascending: true }),
      supabase
        .from("event_guests")
        .select("id, event_id, full_name, email, phone, rsvp_status, notes")
        .eq("user_id", userId),
    ]);

  return {
    events: (eventData ?? []) as EventRecord[],
    guests: (guestData ?? []) as EventGuestRecord[],
    error: eventError || guestError,
  };
}

export default async function ProtectedPage() {
  const claims = await getUser();
  const email = claims.email as string;
  const displayName = email.split("@")[0];
  const userId = claims.sub as string;
  const { events, guests, error } = await getEvents(userId);
  const upcomingEvents = events.filter(
    (event) => new Date(event.starts_at).getTime() >= Date.now(),
  );
  const thisWeekEvents = upcomingEvents.filter((event) => {
    const eventDate = new Date(event.starts_at).getTime();
    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
    return eventDate <= sevenDaysFromNow;
  });
  const invitedGuests = guests.length;
  const confirmedGuests = guests.filter((guest) => guest.rsvp_status === "yes").length;
  const calendarDays = buildCalendarDays(upcomingEvents);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {displayName}</h1>
          <p className="text-muted-foreground mt-1">Your current schedule is here.</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Link href="/protected/events/new">
            <Plus size={16} />
            New Event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Upcoming Events" value={String(upcomingEvents.length)} icon={<Calendar size={20} />} />
        <StatCard label="This Week" value={String(thisWeekEvents.length)} icon={<Clock3 size={20} />} />
        <StatCard label="Confirmed Guests" value={String(confirmedGuests || invitedGuests)} icon={<Users size={20} />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Calendar view</h2>
              <p className="text-sm text-muted-foreground">A quick month snapshot of what is already on the books.</p>
            </div>
            <Badge variant="outline">{monthLabel}</Badge>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => (
              <div
                key={day.dateKey}
                className={[
                  "min-h-24 rounded-xl border p-2 text-left",
                  day.inCurrentMonth ? "bg-background" : "bg-muted/20 text-muted-foreground",
                  day.isToday ? "border-indigo-500 ring-1 ring-indigo-500/40" : "border-border",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{day.dayNumber}</span>
                  {day.eventCount > 0 ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                      {day.eventCount}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Agenda view</h2>
            <p className="text-sm text-muted-foreground">Your next event blocks, sorted by date.</p>
          </div>
          {upcomingEvents.length === 0 && !error ? (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              No agenda items yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {upcomingEvents.slice(0, 6).map((event) => (
                <Link
                  key={event.id}
                  href={`/protected/events/${event.id}`}
                  className="rounded-xl border p-4 transition-colors hover:border-indigo-300 dark:hover:border-indigo-800"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDateRange(event.starts_at, event.ends_at)}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {error ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
            The dashboard could not load every event resource yet. Apply both SQL migrations in the Supabase dashboard, then refresh this page.
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border rounded-xl bg-card text-center gap-4">
            <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Calendar size={32} />
            </div>
            <div>
              <p className="font-medium text-lg">No events yet</p>
              <p className="text-muted-foreground text-sm mt-1">Create your first event to get started.</p>
            </div>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 mt-2">
              <Link href="/protected/events/new">
                <Plus size={16} />
                New Event
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border bg-card p-6 shadow-sm transition-colors hover:border-indigo-300 dark:hover:border-indigo-800"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold tracking-tight">{event.title}</h3>
                        <Badge variant="outline">
                          {guests.filter((guest) => guest.event_id === event.id).length} guests
                        </Badge>
                      </div>
                      {event.description ? (
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock3 className="size-4" />
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

                  <div className="rounded-xl bg-indigo-50 px-4 py-3 text-right dark:bg-indigo-950/40">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                      RSVP pulse
                    </p>
                    <div className="mt-2 flex flex-col gap-1 text-sm text-indigo-700 dark:text-indigo-100">
                      {(() => {
                        const eventGuests = guests.filter((guest) => guest.event_id === event.id);
                        const attending = eventGuests.filter((guest) => guest.rsvp_status === "yes").length;
                        const pending = eventGuests.filter((guest) => guest.rsvp_status === "pending").length;

                        return (
                          <>
                            <span className="text-2xl font-bold">{attending}</span>
                            <span>{pending} pending</span>
                          </>
                        );
                      })()}
                    </div>
                    <Button asChild variant="ghost" className="mt-3 h-8 px-0 text-indigo-700 hover:text-indigo-800 dark:text-indigo-100">
                      <Link href={`/protected/events/${event.id}`}>Open event</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl border bg-card shadow-sm">
      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
