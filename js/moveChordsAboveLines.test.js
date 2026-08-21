// moveChordsAboveLines.test.js
import { describe, it, expect } from 'vitest';
import { moveChordsAboveLines } from './chord_diagrams.js';

describe('moveChordsAboveLines', () => {
  it('moves a single inline chord to its own line above', () => {
    const input = 'Hello [G]World';
    const result = moveChordsAboveLines(input);
    expect(result).toBe('G\nHello World');
  });

  it('joins multiple chords on one line with " | "', () => {
    const input = '[Em]Hello darkness my[D] old friend, I\'ve come to talk with you[Em] again';
    const result = moveChordsAboveLines(input);
    expect(result).toBe('Em | D | Em\nHello darkness my old friend, I\'ve come to talk with you again');
  });

  it('does not glue words together when chords are back-to-back', () => {
    const input = 'Still remains within[G][D]the sound of silence';
    const result = moveChordsAboveLines(input);
    expect(result).toBe('G | D\nStill remains within the sound of silence');
  });

  it('handles a line that is only chords', () => {
    const input = '[Em][G][C][G]';
    const result = moveChordsAboveLines(input);
    expect(result).toBe('Em | G | C | G');
  });

  it('leaves lines without chords untouched', () => {
    const input = 'No chords here at all';
    const result = moveChordsAboveLines(input);
    expect(result).toBe('No chords here at all');
  });

  it('handles slash chords and suffixed chords', () => {
    const input = 'Because[G] a vision[Cadd9/G] softly[G] creeping[Esus2]';
    const result = moveChordsAboveLines(input);
    expect(result).toBe('G | Cadd9/G | G | Esus2\nBecause a vision softly creeping');
  });

  it('preserves multi-line structure', () => {
    const input = '[G]Line one\nLine two\n[C]Line three';
    const result = moveChordsAboveLines(input);
    expect(result).toBe('G\nLine one\nLine two\nC\nLine three');
  });

  it('handles empty input', () => {
    expect(moveChordsAboveLines('')).toBe('');
    expect(moveChordsAboveLines(null)).toBe(null);
  });
});
