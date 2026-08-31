/**
 * Pure helper function to reorder items in an array.
 * Commonly used for drag-and-drop sortable lists and manual ordering.
 */
export function reorder<T>(list: readonly T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  if (removed !== undefined) {
    result.splice(endIndex, 0, removed);
  }
  return result;
}
