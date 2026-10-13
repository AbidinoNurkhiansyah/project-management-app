export function calculateFractionalOrder(
  prevOrder: number | null,
  nextOrder: number | null
): number {
  if (prevOrder === null && nextOrder === null) {
    return 1000;
  }
  if (prevOrder === null && nextOrder !== null) {
    return nextOrder / 2;
  }
  if (prevOrder !== null && nextOrder === null) {
    return prevOrder + 1000;
  }
  return (prevOrder! + nextOrder!) / 2;
}
