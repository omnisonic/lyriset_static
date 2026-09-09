// moveChordsToTop.test.js
import { describe, it, expect } from 'vitest';
import { moveChordsToTop } from './chord_diagrams.js';

describe('moveChordsToTop', () => {
  it('moves a single inline chord above the lyrics', () => {
    const input = 'Hello [G]World';
    const result = moveChordsToTop(input);
    expect(result).toBe('G\n\nHello World');
  });

  it('collects chords from multiple lines into one block, in order, with duplicates', () => {
    const input = '[Em]Hello darkness my[D] old friend\nI\'ve come to talk with you[Em] again';
    const result = moveChordsToTop(input);
    expect(result).toBe('Em | D | Em\n\nHello darkness my old friend\nI\'ve come to talk with you again');
  });

  it('does not glue words together when chords are back-to-back', () => {
    const input = 'Still remains within[G][D]the sound of silence';
    const result = moveChordsToTop(input);
    expect(result).toBe('G | D\n\nStill remains within the sound of silence');
  });

  it('handles a line that is only chords', () => {
    const input = '[Em][G][C][G]';
    const result = moveChordsToTop(input);
    expect(result).toBe('Em | G | C | G\n\n');
  });

  it('leaves lyrics without chords untouched', () => {
    const input = 'No chords here at all';
    const result = moveChordsToTop(input);
    expect(result).toBe('No chords here at all');
  });

  it('handles slash chords and suffixed chords', () => {
    const input = 'Because[G] a vision[Cadd9/G] softly[G] creeping[Esus2]';
    const result = moveChordsToTop(input);
    expect(result).toBe('G | Cadd9/G | G | Esus2\n\nBecause a vision softly creeping');
  });

  it('preserves multi-line lyric structure below the single chord block', () => {
    const input = '[G]Line one\nLine two\n[C]Line three';
    const result = moveChordsToTop(input);
    expect(result).toBe('G | C\n\nLine one\nLine two\nLine three');
  });

  it('handles empty input', () => {
    expect(moveChordsToTop('')).toBe('');
    expect(moveChordsToTop(null)).toBe(null);
  });
});
