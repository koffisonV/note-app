export const PASTEL_COLORS = [
  '#F9E4B7',
  '#D4EDDA',
  '#D1ECF1',
  '#F8D7DA',
] as const;

export type PastelColor = (typeof PASTEL_COLORS)[number];

export function getRandomColor(): PastelColor {
  const index = Math.floor(Math.random() * PASTEL_COLORS.length);
  return PASTEL_COLORS[index];
}
