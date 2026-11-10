export function parsePrice(text: string): number {
  return Number(text.replace(/[^0-9.]/g, ""));
}