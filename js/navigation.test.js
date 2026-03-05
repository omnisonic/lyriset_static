// navigation.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadNextSong, loadPrevSong } from './lyrics_app.js';

// Mock the DOM elements
const createMockDOM = () => {
  document.body.innerHTML = `
    <div id="songTitle">Test Song</div>
    <div id="songArtist">Test Artist</div>
    <div id="lyricsDisplay"></div>
    <div id="lyricsModal" class="modal"></div>
    <div id="editLyricsModal" class="modal"></div>
  `;
};

// Mock localStorage
const mockLocalStorage = {
  storage: {},
  setItem(key, value) {
    this.storage[key] = value;
  },
  getItem(key) {
    return this.storage[key] || null;
  },
  removeItem(key) {
    delete this.storage[key];
  },
  clear() {
    this.storage = {};
  },
  get length() {
    return Object.keys(this.storage).length;
  },
  key(index) {
    const keys = Object.keys(this.storage);
    return keys[index] || null;
  }
};

describe('Song Navigation', () => {
  beforeEach(() => {
    // Setup fresh DOM and localStorage for each test
    createMockDOM();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    window.localStorage.clear();
    window.currentSetNumber = 1;
  });

  afterEach(() => {
    // Clean up
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('loadNextSong', () => {
    it('should load the next song in the set', () => {
      // Setup test data
      window.localStorage.setItem('Song 1', JSON.stringify({
        artist: 'Artist 1',
        lyrics: 'Lyrics 1',
        set: 1
      }));
      window.localStorage.setItem('Song 2', JSON.stringify({
        artist: 'Artist 2',
        lyrics: 'Lyrics 2',
        set: 1
      }));
      window.localStorage.setItem('Song 3', JSON.stringify({
        artist: 'Artist 3',
        lyrics: 'Lyrics 3',
        set: 1
      }));

      // Set current song to Song 1
      document.getElementById('songTitle').textContent = 'Song 1';

      // Mock autoFitLyrics to track calls
      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      // Call loadNextSong
      loadNextSong();

      // Verify the function attempted to call autoFitLyrics with next song
      expect(mockAutoFit).toHaveBeenCalledWith('Song 2', 'Artist 2', 'Lyrics 2');
    });

    it('should cycle back to first song after last song', () => {
      // Setup test data
      window.localStorage.setItem('Song 1', JSON.stringify({
        artist: 'Artist 1',
        lyrics: 'Lyrics 1',
        set: 1
      }));
      window.localStorage.setItem('Song 2', JSON.stringify({
        artist: 'Artist 2',
        lyrics: 'Lyrics 2',
        set: 1
      }));

      // Set current song to Song 2 (last song)
      document.getElementById('songTitle').textContent = 'Song 2';

      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      loadNextSong();

      // Should cycle back to Song 1
      expect(mockAutoFit).toHaveBeenCalledWith('Song 1', 'Artist 1', 'Lyrics 1');
    });

    it('should do nothing if no songs in set', () => {
      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      loadNextSong();

      expect(mockAutoFit).not.toHaveBeenCalled();
    });

    it('should only consider songs in current set', () => {
      // Setup songs in different sets
      window.localStorage.setItem('Song 1', JSON.stringify({
        artist: 'Artist 1',
        lyrics: 'Lyrics 1',
        set: 1
      }));
      window.localStorage.setItem('Song 2', JSON.stringify({
        artist: 'Artist 2',
        lyrics: 'Lyrics 2',
        set: 2
      }));
      window.localStorage.setItem('Song 3', JSON.stringify({
        artist: 'Artist 3',
        lyrics: 'Lyrics 3',
        set: 1
      }));

      document.getElementById('songTitle').textContent = 'Song 1';
      window.currentSetNumber = 1;

      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      loadNextSong();

      // Should skip Song 2 (set 2) and go to Song 3
      expect(mockAutoFit).toHaveBeenCalledWith('Song 3', 'Artist 3', 'Lyrics 3');
    });

    it('should ignore non-song localStorage entries', () => {
      // Setup valid songs
      window.localStorage.setItem('Song 1', JSON.stringify({
        artist: 'Artist 1',
        lyrics: 'Lyrics 1',
        set: 1
      }));
      window.localStorage.setItem('Song 2', JSON.stringify({
        artist: 'Artist 2',
        lyrics: 'Lyrics 2',
        set: 1
      }));

      // Add invalid entries
      window.localStorage.setItem('lyrics-font-size', '16');
      window.localStorage.setItem('lastViewedSong', 'Song 1');
      window.localStorage.setItem('theme-preference', 'dark');

      document.getElementById('songTitle').textContent = 'Song 1';

      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      loadNextSong();

      // Should still work correctly
      expect(mockAutoFit).toHaveBeenCalledWith('Song 2', 'Artist 2', 'Lyrics 2');
    });
  });

  describe('loadPrevSong', () => {
    it('should load the previous song in the set', () => {
      // Setup test data
      window.localStorage.setItem('Song 1', JSON.stringify({
        artist: 'Artist 1',
        lyrics: 'Lyrics 1',
        set: 1
      }));
      window.localStorage.setItem('Song 2', JSON.stringify({
        artist: 'Artist 2',
        lyrics: 'Lyrics 2',
        set: 1
      }));
      window.localStorage.setItem('Song 3', JSON.stringify({
        artist: 'Artist 3',
        lyrics: 'Lyrics 3',
        set: 1
      }));

      // Set current song to Song 3
      document.getElementById('songTitle').textContent = 'Song 3';

      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      loadPrevSong();

      // Should go to Song 2
      expect(mockAutoFit).toHaveBeenCalledWith('Song 2', 'Artist 2', 'Lyrics 2');
    });

    it('should cycle to last song when at first song', () => {
      // Setup test data
      window.localStorage.setItem('Song 1', JSON.stringify({
        artist: 'Artist 1',
        lyrics: 'Lyrics 1',
        set: 1
      }));
      window.localStorage.setItem('Song 2', JSON.stringify({
        artist: 'Artist 2',
        lyrics: 'Lyrics 2',
        set: 1
      }));

      // Set current song to Song 1 (first song)
      document.getElementById('songTitle').textContent = 'Song 1';

      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      loadPrevSong();

      // Should cycle to Song 2 (last song)
      expect(mockAutoFit).toHaveBeenCalledWith('Song 2', 'Artist 2', 'Lyrics 2');
    });

    it('should do nothing if no songs in set', () => {
      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      loadPrevSong();

      expect(mockAutoFit).not.toHaveBeenCalled();
    });

    it('should handle single song in set', () => {
      window.localStorage.setItem('Song 1', JSON.stringify({
        artist: 'Artist 1',
        lyrics: 'Lyrics 1',
        set: 1
      }));

      document.getElementById('songTitle').textContent = 'Song 1';

      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      loadPrevSong();

      // Should cycle to itself
      expect(mockAutoFit).toHaveBeenCalledWith('Song 1', 'Artist 1', 'Lyrics 1');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid JSON in localStorage', () => {
      window.localStorage.setItem('Song 1', 'invalid json');
      window.localStorage.setItem('Song 2', JSON.stringify({
        artist: 'Artist 2',
        lyrics: 'Lyrics 2',
        set: 1
      }));

      document.getElementById('songTitle').textContent = 'Song 1';

      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      // Should not throw, should skip invalid entry
      expect(() => loadNextSong()).not.toThrow();
      expect(mockAutoFit).toHaveBeenCalledWith('Song 2', 'Artist 2', 'Lyrics 2');
    });

    it('should handle missing song data', () => {
      window.localStorage.setItem('Song 1', JSON.stringify({
        artist: 'Artist 1',
        // Missing lyrics
        set: 1
      }));
      window.localStorage.setItem('Song 2', JSON.stringify({
        artist: 'Artist 2',
        lyrics: 'Lyrics 2',
        set: 1
      }));

      document.getElementById('songTitle').textContent = 'Song 1';

      const mockAutoFit = vi.fn();
      window.autoFitLyrics = mockAutoFit;

      loadNextSong();

      // Should still call with available data
      expect(mockAutoFit).toHaveBeenCalledWith('Song 2', 'Artist 2', 'Lyrics 2');
    });
  });
});