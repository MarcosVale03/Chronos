export const eventErrorMessages: Record<string, string> = {
  "delete-failed": "The event could not be deleted. Try again.",
  "guest-delete-failed": "The guest could not be removed. Try again.",
  "guest-save-failed": "The guest could not be saved. Make sure the guest migration has been applied in Supabase.",
  "guest-update-failed": "The RSVP update failed. Try again.",
  "invalid-rsvp": "The RSVP status was invalid.",
  "missing-guest-name": "Guest name is required.",
  "invalid-date-range": "End time must be after the start time.",
  "invalid-guest-limit": "Guest limit must be zero or greater.",
  "missing-fields": "Title and start time are required.",
  "save-failed": "The event could not be updated. Try again.",
};

export function validateEventTitle(title: string): boolean {
  return title.trim().length > 0;
}

export function validateGuestName(name: string): boolean {
  return name.trim().length > 0;
}

export function validateRsvpStatus(status: string): boolean {
  return ["pending", "yes", "no", "maybe"].includes(status);
}

export function validateGuestLimit(limit: number | null): boolean {
  if (limit === null) return true;
  return Number.isFinite(limit) && limit >= 0;
}

export function validateDateRange(startsAt: string, endsAt: string | null): boolean {
  if (!endsAt) return true;
  return new Date(endsAt).getTime() >= new Date(startsAt).getTime();
}
