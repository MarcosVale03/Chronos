"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function revalidateEventScreens(eventId: string) {
  revalidatePath("/protected");
  revalidatePath(`/protected/events/${eventId}`);
  revalidatePath(`/protected/events/${eventId}/edit`);
}

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/auth/login");
  }

  return {
    supabase,
    userId: data.claims.sub,
  };
}

async function ensureOwnedEvent(eventId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    redirect("/protected?error=event-not-found");
  }
}

function parseEventFields(formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() || null;
  const location = formData.get("location")?.toString().trim() || null;
  const startsAt = formData.get("startsAt")?.toString() ?? "";
  const endsAtValue = formData.get("endsAt")?.toString().trim() ?? "";
  const endsAt = endsAtValue ? endsAtValue : null;
  const guestLimitValue = formData.get("guestLimit")?.toString().trim() ?? "";
  const guestLimit = guestLimitValue ? Number(guestLimitValue) : null;

  return {
    title,
    description,
    location,
    startsAt,
    endsAt,
    guestLimit,
  };
}

export async function createEvent(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const { title, description, location, startsAt, endsAt, guestLimit } =
    parseEventFields(formData);

  if (!title || !startsAt) {
    redirect("/protected/events/new?error=missing-fields");
  }

  if (guestLimit !== null && (!Number.isFinite(guestLimit) || guestLimit < 0)) {
    redirect("/protected/events/new?error=invalid-guest-limit");
  }

  if (endsAt && new Date(endsAt).getTime() < new Date(startsAt).getTime()) {
    redirect("/protected/events/new?error=invalid-date-range");
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
    user_id: userId,
    title,
    description,
    location,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      guest_limit: guestLimit,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/protected/events/new?error=save-failed");
  }

  revalidateEventScreens(data.id);
  redirect(`/protected/events/${data.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const { supabase, userId } = await requireUser();
  await ensureOwnedEvent(eventId, userId);

  const { title, description, location, startsAt, endsAt, guestLimit } =
    parseEventFields(formData);

  if (!title || !startsAt) {
    redirect(`/protected/events/${eventId}/edit?error=missing-fields`);
  }

  if (guestLimit !== null && (!Number.isFinite(guestLimit) || guestLimit < 0)) {
    redirect(`/protected/events/${eventId}/edit?error=invalid-guest-limit`);
  }

  if (endsAt && new Date(endsAt).getTime() < new Date(startsAt).getTime()) {
    redirect(`/protected/events/${eventId}/edit?error=invalid-date-range`);
  }

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
      location,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      guest_limit: guestLimit,
    })
    .eq("id", eventId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/protected/events/${eventId}/edit?error=save-failed`);
  }

  revalidateEventScreens(eventId);
  redirect(`/protected/events/${eventId}`);
}

export async function deleteEvent(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const eventId = formData.get("eventId")?.toString() ?? "";

  if (!eventId) {
    redirect("/protected");
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/protected/events/${eventId}?error=delete-failed`);
  }

  revalidatePath("/protected");
  redirect("/protected?status=event-deleted");
}

export async function addGuest(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const eventId = formData.get("eventId")?.toString() ?? "";
  const fullName = formData.get("fullName")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() || null;
  const phone = formData.get("phone")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;
  const rsvpStatus = formData.get("rsvpStatus")?.toString().trim() || "pending";

  if (!eventId) {
    redirect("/protected");
  }

  await ensureOwnedEvent(eventId, userId);

  if (!fullName) {
    redirect(`/protected/events/${eventId}?error=missing-guest-name`);
  }

  if (!["pending", "yes", "no", "maybe"].includes(rsvpStatus)) {
    redirect(`/protected/events/${eventId}?error=invalid-rsvp`);
  }

  const { error } = await supabase.from("event_guests").insert({
    event_id: eventId,
    user_id: userId,
    full_name: fullName,
    email,
    phone,
    notes,
    rsvp_status: rsvpStatus,
  });

  if (error) {
    redirect(`/protected/events/${eventId}?error=guest-save-failed`);
  }

  revalidateEventScreens(eventId);
  redirect(`/protected/events/${eventId}`);
}

export async function updateGuestRsvp(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const eventId = formData.get("eventId")?.toString() ?? "";
  const guestId = formData.get("guestId")?.toString() ?? "";
  const rsvpStatus = formData.get("rsvpStatus")?.toString().trim() ?? "pending";

  if (!eventId || !guestId) {
    redirect("/protected");
  }

  await ensureOwnedEvent(eventId, userId);

  if (!["pending", "yes", "no", "maybe"].includes(rsvpStatus)) {
    redirect(`/protected/events/${eventId}?error=invalid-rsvp`);
  }

  const { error } = await supabase
    .from("event_guests")
    .update({ rsvp_status: rsvpStatus })
    .eq("id", guestId)
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/protected/events/${eventId}?error=guest-update-failed`);
  }

  revalidateEventScreens(eventId);
  redirect(`/protected/events/${eventId}`);
}

export async function removeGuest(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const eventId = formData.get("eventId")?.toString() ?? "";
  const guestId = formData.get("guestId")?.toString() ?? "";

  if (!eventId || !guestId) {
    redirect("/protected");
  }

  await ensureOwnedEvent(eventId, userId);

  const { error } = await supabase
    .from("event_guests")
    .delete()
    .eq("id", guestId)
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/protected/events/${eventId}?error=guest-delete-failed`);
  }

  revalidateEventScreens(eventId);
  redirect(`/protected/events/${eventId}`);
}