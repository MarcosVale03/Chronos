"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventGuestRecord, getRsvpLabel, getRsvpVariant } from "@/lib/events";
import { removeGuest, updateGuestRsvp } from "@/app/protected/events/actions";

export function EventGuestList({
  eventId,
  guests,
  error,
}: {
  eventId: string;
  guests: EventGuestRecord[];
  error: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest list</CardTitle>
        <CardDescription>
          Add invitees and update their RSVP status as responses come in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
            Guests could not load yet. Apply the guest migration in Supabase, then refresh this page.
          </div>
        ) : guests.length === 0 ? (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            No guests added yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {guests.map((guest) => (
              <div key={guest.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{guest.full_name}</p>
                      <Badge variant={getRsvpVariant(guest.rsvp_status)}>
                        {getRsvpLabel(guest.rsvp_status)}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                      {guest.email ? <span>{guest.email}</span> : null}
                      {guest.phone ? <span>{guest.phone}</span> : null}
                      {guest.notes ? <span>{guest.notes}</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <form action={updateGuestRsvp} className="flex gap-2">
                      <input type="hidden" name="eventId" value={eventId} />
                      <input type="hidden" name="guestId" value={guest.id} />
                      <select
                        name="rsvpStatus"
                        defaultValue={guest.rsvp_status}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="yes">Attending</option>
                        <option value="maybe">Maybe</option>
                        <option value="no">Declined</option>
                      </select>
                      <Button type="submit" variant="outline">Update</Button>
                    </form>
                    <form action={removeGuest}>
                      <input type="hidden" name="eventId" value={eventId} />
                      <input type="hidden" name="guestId" value={guest.id} />
                      <Button type="submit" variant="ghost" className="text-rose-600 hover:text-rose-700">
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
