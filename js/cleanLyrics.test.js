// cleanLyrics.test.js
import { describe, it, expect } from 'vitest';
import { cleanLyrics } from './clean_lyrics.js';

describe('cleanLyrics', () => {
  it('should remove chord brackets', () => {
    const input = 'Hello [G]World [C]';
    const result = cleanLyrics(input);
    expect(result).toContain('Hello');
    expect(result).toContain('World');
    expect(result).not.toContain('[');
  });

  it('should remove multiple chords in one line', () => {
    const input = '[G]Hello [C]World [D]Test';
    const result = cleanLyrics(input);
    expect(result).toContain('Hello');
    expect(result).toContain('World');
    expect(result).toContain('Test');
  });

  it('should preserve line breaks', () => {
    const input = 'Line 1\nLine 2\nLine 3';
    const result = cleanLyrics(input);
    expect(result).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should remove empty lines between lyrics', () => {
    const input = 'Line 1\n\n\nLine 2';
    const result = cleanLyrics(input);
    // Should collapse multiple blank lines
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
  });

  it('should remove metadata lines (with colons)', () => {
    const input = 'Verse 1:\nHello';
    const result = cleanLyrics(input);
    expect(result).toBe('Hello');
    expect(result).not.toContain(':');
  });

  it('should remove lines with parentheses', () => {
    const input = 'Hello\n(Chorus)\nWorld';
    const result = cleanLyrics(input);
    expect(result).toContain('Hello');
    expect(result).toContain('World');
    expect(result).not.toContain('(');
  });

  it('should remove lines with colons', () => {
    const input = 'Intro:\nHello\nBridge:\nWorld';
    const result = cleanLyrics(input);
    expect(result).toContain('Hello');
    expect(result).toContain('World');
    expect(result).not.toContain(':');
  });

  it('should handle empty input', () => {
    expect(cleanLyrics('')).toBe('');
    expect(cleanLyrics(null)).toBe('');
    expect(cleanLyrics(undefined)).toBe('');
  });

  it('should filter out lines with only symbols', () => {
    const input = '[G][C][D]';
    const result = cleanLyrics(input);
    // Should be empty or very minimal since only chords/symbols
    expect(result.length).toBeLessThan(5);
  });

  it('should keep lyrics with meaningful content', () => {
    const input = `Hello World
This is a line of lyrics
More content here`;

    const result = cleanLyrics(input);
    expect(result).toContain('Hello');
    expect(result).toContain('World');
    expect(result).toContain('line');
  });

  it('should remove lines with only whitespace', () => {
    const input = 'Hello\n   \nWorld';
    const result = cleanLyrics(input);
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });
});