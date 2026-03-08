export function wrapBold(text: string): string {
  return `**${text}**`;
}

export function wrapItalic(text: string): string {
  return `*${text}*`;
}

export function wrapUnderline(text: string): string {
  return `<u>${text}</u>`;
}

export function toBulletList(text: string): string {
  return text
    .split('\n')
    .map((line) => `- ${line}`)
    .join('\n');
}

export function toNumberedList(text: string): string {
  return text
    .split('\n')
    .map((line, i) => `${i + 1}. ${line}`)
    .join('\n');
}

type Formatter = (text: string) => string;

interface InsertResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export function applyFormat(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  formatter: Formatter,
): InsertResult {
  const before = content.slice(0, selectionStart);
  const selected = content.slice(selectionStart, selectionEnd);
  const after = content.slice(selectionEnd);

  const formatted = formatter(selected || 'text');
  const newValue = before + formatted + after;

  return {
    value: newValue,
    selectionStart: before.length,
    selectionEnd: before.length + formatted.length,
  };
}
