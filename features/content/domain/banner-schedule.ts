/** Returns true when a banner is within its optional start/end schedule window. */
export function isBannerScheduleActive(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  now = new Date()
): boolean {
  const start = startsAt ? Date.parse(startsAt) : null;
  const end = endsAt ? Date.parse(endsAt) : null;

  if (start !== null && !Number.isNaN(start) && now.getTime() < start) {
    return false;
  }

  if (end !== null && !Number.isNaN(end) && now.getTime() > end) {
    return false;
  }

  return true;
}
