export function checkSorted(arr: any[]) {
  const sortArr = [...arr].sort((a, b) => a - b);
  return JSON.stringify(arr) === JSON.stringify(sortArr);
}
