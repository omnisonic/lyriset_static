// splitLongLine.test.js
import { describe, it, expect } from 'vitest';
import { splitLongLine, alignChordsToLyrics } from './chord_diagrams.js';

describe('splitLongLine', () => {
  it('leaves short lines untouched', () => {
    expect(splitLongLine('Hello world', 60)).toEqual(['Hello world']);
  });

  it('splits a long line at the comma nearest the midpoint', () => {
    const line = "Hello darkness my old friend, I've come to talk with you again";
    const result = splitLongLine(line, 60);
    expect(result).toEqual([
      "Hello darkness my old friend,",
      "I've come to talk with you again"
    ]);
  });

  it('falls back to the nearest space when there is no comma', () => {
    const line = 'a'.repeat(30) + ' ' + 'b'.repeat(30);
    const result = splitLongLine(line, 40);
    expect(result).toEqual(['a'.repeat(30), 'b'.repeat(30)]);
  });

  it('does not split a single long word with no break point', () => {
    const line = 'a'.repeat(80);
    expect(splitLongLine(line, 60)).toEqual([line]);
  });

  it('recurses to split very long lines more than once', () => {
    const clause = 'this is a reasonably long clause of words';
    const line = `${clause}, ${clause}, ${clause}`;
    const result = splitLongLine(line, 40);
    result.forEach(part => expect(part.length).toBeLessThanOrEqual(45));
    expect(result.join(' ')).toContain('this is a reasonably long clause of words');
  });

  it('ignores a comma near the edge in favor of a centered space', () => {
    // Regression: a comma close to the end of the line used to always win
    // over a well-centered space, producing a lopsided split (a long first
    // half, a short second half) that then failed to recurse further
    // because the same edge comma kept getting picked on the first half.
    const line = 'I turned my collar to the cold and dampWhen my eyes were stabbed by the flash of a neon light That split the night, andtouched the sound of silence';
    const result = splitLongLine(line, 50);
    result.forEach(part => expect(part.length).toBeLessThanOrEqual(55));
    expect(result.length).toBeGreaterThan(2);
  });

  it('handles empty input', () => {
    expect(splitLongLine('', 60)).toEqual(['']);
    expect(splitLongLine(null, 60)).toEqual([null]);
  });

  it('splits a 60-character line using the default threshold', () => {
    // Regression: this line is exactly 60 chars once chords are stripped,
    // which previously sat right at the (inclusive) threshold and was
    // silently skipped instead of being split.
    const line = 'And in the naked light I saw, ten thousand people maybe more';
    expect(line.length).toBeGreaterThan(50);
    const result = splitLongLine(line);
    expect(result.length).toBeGreaterThan(1);
    result.forEach(part => expect(part.length).toBeLessThanOrEqual(50));
  });
});

describe('alignChordsToLyrics with long lines', () => {
  it('splits a long chord-aligned line and keeps chords over the right characters', () => {
    const input = "[Em]Hello darkness my[D] old friend, I've come to talk with you[Em] again";
    const result = alignChordsToLyrics(input, 60);
    const lines = result.split('\n');

    // Expect two chord/lyric row pairs
    expect(lines.length).toBe(4);
    const [chordRow1, lyricRow1, chordRow2, lyricRow2] = lines;

    expect(lyricRow1).toBe("Hello darkness my old friend,");
    expect(lyricRow2).toBe("I've come to talk with you again");

    expect(chordRow1.slice(0, 2)).toBe('Em');
    const dIndex = lyricRow1.indexOf(' old friend');
    expect(chordRow1[dIndex]).toBe('D');

    expect(chordRow2.trim()).toBe('Em');
    const emIndex = lyricRow2.indexOf(' again');
    expect(chordRow2[emIndex]).toBe('E');
  });

  it('leaves short chord-aligned lines as a single pair', () => {
    const input = 'Hello [G]World';
    const result = alignChordsToLyrics(input, 60);
    expect(result.split('\n').length).toBe(2);
  });

  it('splits a 60-character aligned line using the default threshold', () => {
    const input = 'And in the naked light[D] I saw, ten thousand people maybe[Em] more';
    const result = alignChordsToLyrics(input);
    // More than one chord/lyric row pair
    expect(result.split('\n').length).toBeGreaterThan(2);
  });
});
