import { describe, it, expect } from 'vitest';
import {
  wrapBold,
  wrapItalic,
  wrapUnderline,
  toBulletList,
  toNumberedList,
  applyFormat,
} from '@/utils/markdown';

describe('wrapBold', () => {
  it('wraps text with double asterisks', () => {
    expect(wrapBold('hello')).toBe('**hello**');
  });

  it('wraps empty string', () => {
    expect(wrapBold('')).toBe('****');
  });
});

describe('wrapItalic', () => {
  it('wraps text with single asterisks', () => {
    expect(wrapItalic('hello')).toBe('*hello*');
  });
});

describe('wrapUnderline', () => {
  it('wraps text with <u> tags', () => {
    expect(wrapUnderline('hello')).toBe('<u>hello</u>');
  });
});

describe('toBulletList', () => {
  it('converts lines to bullet list', () => {
    expect(toBulletList('a\nb')).toBe('- a\n- b');
  });

  it('handles single line', () => {
    expect(toBulletList('item')).toBe('- item');
  });
});

describe('toNumberedList', () => {
  it('converts lines to numbered list', () => {
    expect(toNumberedList('a\nb')).toBe('1. a\n2. b');
  });

  it('handles single line', () => {
    expect(toNumberedList('item')).toBe('1. item');
  });
});

describe('applyFormat', () => {
  it('formats selected text within content', () => {
    const content = 'hello world';
    const result = applyFormat(content, 6, 11, wrapBold);
    expect(result.value).toBe('hello **world**');
  });

  it('inserts placeholder when no text is selected', () => {
    const content = 'hello ';
    const result = applyFormat(content, 6, 6, wrapBold);
    expect(result.value).toBe('hello **text**');
  });
});
