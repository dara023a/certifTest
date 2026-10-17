/**
 * Characters encodable by pdf-lib's standard (WinAnsi / cp1252) fonts.
 *
 * pdf-lib throws `WinAnsi cannot encode "…"` for anything outside this set
 * (emoji, CJK, Arabic, …). We validate against it at the form boundary and
 * sanitize as a last resort so PDF generation never fails mid-flow.
 */
const WIN_ANSI_PATTERN =
  /^[\u0000-\u00FF\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178]*$/;

/** True when every character can be encoded by the standard PDF fonts. */
export function isWinAnsi(value: string): boolean {
  return WIN_ANSI_PATTERN.test(value);
}

/** Replaces characters the standard PDF fonts cannot encode with `?`. */
export function sanitizeWinAnsi(value: string): string {
  let out = "";
  for (const char of value) {
    out += WIN_ANSI_PATTERN.test(char) ? char : "?";
  }
  return out;
}
