const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse ?from=&to= from the URL, defaulting both to today and correcting
 * bad input instead of producing an empty range. */
export function parseRange(searchParams: { from?: string; to?: string }): { from: string; to: string } {
  const defaultDate = fmt(new Date());

  let from = searchParams.from && DATE_RE.test(searchParams.from) ? searchParams.from : defaultDate;
  let to = searchParams.to && DATE_RE.test(searchParams.to) ? searchParams.to : defaultDate;

  if (from > to) [from, to] = [to, from];
  return { from, to };
}
