// alignChordsToLyrics.test.js
import { describe, it, expect } from 'vitest';
import { alignChordsToLyrics } from './chord_diagrams.js';

describe('alignChordsToLyrics', () => {
  it('positions a single inline chord above the character it preceded', () => {
    const input = 'Hello [G]World';
    const result = alignChordsToLyrics(input);
    expect(result).toBe('      G\nHello World');
  });

  it('positions a chord at the start of a line above the first character', () => {
    const input = '[Em]Hello darkness my old friend';
    const result = alignChordsToLyrics(input);
    expect(result).toBe('Em\nHello darkness my old friend');
  });

  it('positions multiple chords above their respective columns', () => {
    const input = '[Em]Hello darkness my[D] old friend';
    const result = alignChordsToLyrics(input);
    const lines = result.split('\n');
    expect(lines[1]).toBe('Hello darkness my old friend');
    expect(lines[0].slice(0, 2)).toBe('Em');
    // "D" should align with the space right after "my" (index 17 in the lyric line)
    const dIndex = lines[1].indexOf(' old friend');
    expect(lines[0][dIndex]).toBe('D');
  });

  it('pushes back-to-back chords apart instead of overlapping', () => {
    const input = 'Still remains within[G][D]the sound of silence';
    const result = alignChordsToLyrics(input);
    const lines = result.split('\n');
    expect(lines[1]).toBe('Still remains within the sound of silence');
    const gIndex = lines[0].indexOf('G');
    const dIndex = lines[0].indexOf('D');
    expect(dIndex).toBeGreaterThan(gIndex);
    // No overlap: at least one space between chord tokens
    expect(lines[0].slice(gIndex, dIndex)).toBe('G ');
  });

  it('handles a line that is only chords', () => {
    const input = '[Em][G][C][G]';
    const result = alignChordsToLyrics(input);
    expect(result).toBe('Em G C G');
  });

  it('leaves lines without chords untouched', () => {
    const input = 'No chords here at all';
    const result = alignChordsToLyrics(input);
    expect(result).toBe('No chords here at all');
  });

  it('handles slash chords and suffixed chords without overlap', () => {
    const input = 'Because[G] a vision[Cadd9/G] softly[G] creeping[Esus2]';
    const result = alignChordsToLyrics(input);
    const lines = result.split('\n');
    expect(lines[1]).toBe('Because a vision softly creeping');
  });

  it('preserves multi-line structure', () => {
    const input = '[G]Line one\nLine two\n[C]Line three';
    const result = alignChordsToLyrics(input);
    expect(result).toBe('G\nLine one\nLine two\nC\nLine three');
  });

  it('handles empty input', () => {
    expect(alignChordsToLyrics('')).toBe('');
    expect(alignChordsToLyrics(null)).toBe(null);
  });

  it('does not glue words together when a single chord tag has no surrounding spaces', () => {
    const input = 'damp[C]When my eyes';
    const result = alignChordsToLyrics(input);
    const lines = result.split('\n');
    expect(lines[1]).toBe('damp When my eyes');
  });

  it('does not leave a double space when a space already follows the tag', () => {
    const input = 'Hello darkness my[D] old friend';
    const result = alignChordsToLyrics(input);
    const lines = result.split('\n');
    expect(lines[1]).toBe('Hello darkness my old friend');
    expect(lines[1]).not.toMatch(/ {2}/);
  });

  it('keeps every row under the length threshold even when a comma sits far from center', () => {
    // Regression: a comma near the end of a long line previously won over a
    // well-centered space, and the recursive split failed to re-split the
    // resulting long first half because the same edge comma was found again.
    const input = "I turned my collar to[C] the cold and[G] damp[C]When my eyes were stabbed by the flash of a neon[G] light That split the night,[Em] and[G]touched the[D] sound of[Em] silence";
    const result = alignChordsToLyrics(input, 50);
    const lyricRows = result.split('\n').filter((_, i) => i % 2 === 1);
    lyricRows.forEach(row => expect(row.length).toBeLessThanOrEqual(50));
    expect(lyricRows.join(' ')).not.toMatch(/[a-z][A-Z]/); // no glued words
  });
});
