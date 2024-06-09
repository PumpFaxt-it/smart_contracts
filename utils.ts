export function checkSorted(arr: any[]) {
  const sortArr = [...arr].sort((a, b) => a - b);
  return JSON.stringify(arr) === JSON.stringify(sortArr);
}

const consoleColors = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

export function consoleColor(clr: keyof typeof consoleColors) {
  return consoleColors[clr];
}
