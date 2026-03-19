"use client";

import { Users } from "lucide-react";
import { addGuest } from "@/app/protected/events/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EventAddGuestForm({ eventId }: { eventId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add guest</CardTitle>
        <CardDescription>
          Start building the invite list and optionally mark their initial RSVP.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={addGuest} className="grid gap-4">
          <input type="hidden" name="eventId" value={eventId} />
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" placeholder="Jordan Lee" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="jordan@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" placeholder="(555) 123-4567" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rsvpStatus">RSVP status</Label>
            <select
              id="rsvpStatus"
              name="rsvpStatus"
              defaultValue="pending"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="yes">Attending</option>
              <option value="maybe">Maybe</option>
              <option value="no">Declined</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Dietary preferences, plus-one status, seat preference..."
            />
          </div>
          <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Users />
            Add guest
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
