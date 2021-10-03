export function replaceBetween(originalString, string, start, end) {
  const startString = originalString.substring(0, start);
  const endString = originalString.substring(end);
  return startString + string + endString;
}
