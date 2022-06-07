// Creates an object with their keys sorted alphabetically
export function sortObjectKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([key1], [key2]) => key1.localeCompare(key2))
  );
}
