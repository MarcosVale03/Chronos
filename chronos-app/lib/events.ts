export type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  guest_limit: number | null;
};

export type EventGuestRecord = {
  id: string;
  event_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  rsvp_status: "pending" | "yes" | "no" | "maybe";
  notes: string | null;
};

export function formatDateRange(startsAt: string, endsAt: string | null) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(start);
  const startTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(start);

  if (!end) {
    return `${dateLabel} at ${startTime}`;
  }

  const sameDay = start.toDateString() === end.toDateString();
  const endTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(end);

  if (sameDay) {
    return `${dateLabel} from ${startTime} to ${endTime}`;
  }

  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(end);

  return `${dateLabel} at ${startTime} to ${endLabel}`;
}

export function formatDateTimeInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getRsvpLabel(status: EventGuestRecord["rsvp_status"]) {
  switch (status) {
    case "yes":
      return "Attending";
    case "no":
      return "Declined";
    case "maybe":
      return "Maybe";
    default:
      return "Pending";
  }
}

export function getRsvpVariant(status: EventGuestRecord["rsvp_status"]) {
  switch (status) {
    case "yes":
      return "default" as const;
    case "no":
      return "destructive" as const;
    case "maybe":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function buildCalendarDays(events: EventRecord[], monthAnchor = new Date()) {
  const firstDayOfMonth = new Date(
    monthAnchor.getFullYear(),
    monthAnchor.getMonth(),
    1,
  );
  const firstVisibleDay = new Date(firstDayOfMonth);
  firstVisibleDay.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisibleDay);
    date.setDate(firstVisibleDay.getDate() + index);
    const dateKey = date.toISOString().slice(0, 10);
    const eventCount = events.filter(
      (event) => event.starts_at.slice(0, 10) === dateKey,
    ).length;

    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      eventCount,
      inCurrentMonth: date.getMonth() === monthAnchor.getMonth(),
      isToday: date.toDateString() === new Date().toDateString(),
    };
  });
}