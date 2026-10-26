/**
 * The values in the output of a `busctl --json=short` call: one JSON object per line, whose
 * `data` holds the value (for a method, the array of its return values). A line that isn't
 * shaped like that gives undefined.
 */
export function parseBusctlValues(output: string): unknown[] {
  return output
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line): unknown => JSON.parse(line))
    .map((value) => (isBusctlValue(value) ? value.data : undefined))
}

function isBusctlValue(value: unknown): value is { data: unknown } {
  return typeof value === 'object' && value !== null && 'data' in value
}
