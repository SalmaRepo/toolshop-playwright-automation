export function generateUniqueEmail(prefix = "salma") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}