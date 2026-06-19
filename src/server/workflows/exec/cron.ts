// Minimal standard 5-field cron matcher.
//
// Fields, in order:
//   minute        0-59
//   hour          0-23
//   day-of-month  1-31
//   month         1-12
//   day-of-week   0-6   (0 = Sunday)
//
// Each field supports:
//   *        any value
//   n        a single number          (e.g. "5")
//   * /n     a step over the range     (e.g. "*​/15"  -> 0,15,30,45)
//   a-b      an inclusive range        (e.g. "9-17")
//   a-b/n    a stepped range           (e.g. "0-30/10")
//   a,b,c    a comma list of any above (e.g. "0,15,30,45")
//
// Returns false on any malformed input rather than throwing, so a bad cron in
// one workflow can never crash the scheduler loop.

interface FieldRange {
  min: number;
  max: number;
}

// Allowed value range for each of the five fields, by position.
const FIELD_RANGES: FieldRange[] = [
  { min: 0, max: 59 }, // minute
  { min: 0, max: 23 }, // hour
  { min: 1, max: 31 }, // day-of-month
  { min: 1, max: 12 }, // month
  { min: 0, max: 6 }, // day-of-week
];

/**
 * Parse a single cron field into the explicit set of values it matches.
 * Returns null if the field is malformed (out of range, bad syntax, etc.).
 */
function parseField(field: string, range: FieldRange): Set<number> | null {
  const values = new Set<number>();

  // A field may be a comma-separated list; each part is matched independently.
  for (const part of field.split(",")) {
    const token = part.trim();
    if (token === "") return null; // empty list entry, e.g. "1,,2"

    // Split off an optional "/step" suffix.
    const [rangePart, stepPart, ...rest] = token.split("/");
    if (rest.length > 0) return null; // more than one "/" — malformed

    let step = 1;
    if (stepPart !== undefined) {
      // A step must be a positive integer.
      if (!/^\d+$/.test(stepPart)) return null;
      step = Number(stepPart);
      if (step <= 0) return null;
    }

    // Determine the [lo, hi] bounds this part iterates over.
    let lo: number;
    let hi: number;

    if (rangePart === "*") {
      // "*" or "*​/n" spans the whole field range.
      lo = range.min;
      hi = range.max;
    } else if (/^\d+$/.test(rangePart)) {
      // A bare number. With a step it behaves like "n-max/step" (cron convention).
      lo = Number(rangePart);
      hi = stepPart !== undefined ? range.max : lo;
    } else {
      // Must be an "a-b" range.
      const m = /^(\d+)-(\d+)$/.exec(rangePart);
      if (!m) return null;
      lo = Number(m[1]);
      hi = Number(m[2]);
    }

    // Bounds must sit inside the field's legal range and be ordered.
    if (lo < range.min || hi > range.max || lo > hi) return null;

    for (let v = lo; v <= hi; v += step) values.add(v);
  }

  return values.size > 0 ? values : null;
}

/**
 * Returns true when `date` satisfies the standard 5-field cron `expr`.
 *
 * Day-of-month and day-of-week use the standard cron OR-rule: when BOTH are
 * restricted (neither is "*"), the date matches if EITHER one matches. When one
 * is "*", only the other constrains the match.
 *
 * Returns false for any malformed expression.
 */
export function cronMatches(expr: string, date: Date): boolean {
  if (typeof expr !== "string") return false;

  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) return false;

  const sets: Array<Set<number>> = [];
  for (let i = 0; i < 5; i++) {
    const parsed = parseField(fields[i], FIELD_RANGES[i]);
    if (!parsed) return false;
    sets.push(parsed);
  }

  const [minuteSet, hourSet, domSet, monthSet, dowSet] = sets;

  const minuteOk = minuteSet.has(date.getMinutes());
  const hourOk = hourSet.has(date.getHours());
  const monthOk = monthSet.has(date.getMonth() + 1); // getMonth() is 0-based
  if (!minuteOk || !hourOk || !monthOk) return false;

  // Day-of-month / day-of-week OR-rule.
  const domRestricted = fields[2].trim() !== "*";
  const dowRestricted = fields[4].trim() !== "*";
  const domOk = domSet.has(date.getDate());
  const dowOk = dowSet.has(date.getDay()); // getDay(): 0=Sun..6=Sat

  if (domRestricted && dowRestricted) return domOk || dowOk;
  if (domRestricted) return domOk;
  if (dowRestricted) return dowOk;
  return true; // both "*"
}
