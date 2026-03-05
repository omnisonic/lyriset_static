// addSong.test.js — integration test that exercises the real form handler in lyrics_app.js
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

// Submit the add-song form with the given values; returns whether default was prevented
function submitForm(title, artist, lyrics) {
  document.getElementById('songInput').value = title;
  document.getElementById('artistInput').value = artist;
  document.getElementById('lyricsText').value = lyrics;

  const form = document.getElementById('lyricsForm');
  const event = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  return event.defaultPrevented;
}

describe('Add Song', () => {
  beforeAll(async () => {
    // Build the DOM BEFORE importing the module, so the DOMContentLoaded
    // handler inside lyrics_app.js finds the form and attaches to it.
    document.body.innerHTML = `
      <div id="songTitle">Select a Song</div>
      <div id="songArtist"></div>
      <div id="lyricsDisplay"></div>
      <ul id="songDropdown"></ul>
      <button id="setDropdownButton">Set 1</button>
      <form id="lyricsForm">
        <input id="songInput" type="text" />
        <input id="artistInput" type="text" />
        <textarea id="lyricsText"></textarea>
        <input type="hidden" id="formType" value="add" />
        <button type="submit">Submit</button>
      </form>
      <div id="lyricsModal"></div>
    `;

    // Mock globals that come from lyrics_storage.js (not imported as a module)
    window.loadDefaultSongs = vi.fn().mockResolvedValue(undefined);
    window.updateSongDropdown = vi.fn();
    window.currentSetNumber = 1;

    // Mock ResizeObserver used in the DOMContentLoaded handler (must be a class)
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Import the module — it registers a DOMContentLoaded listener
    await import('./lyrics_app.js');

    // Dispatch DOMContentLoaded so the handler runs and attaches the form listener
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  beforeEach(() => {
    localStorage.clear();
    window.currentSetNumber = 1;
    // Reset the mocks that track call counts between tests
    window.updateSongDropdown.mockClear();
    // Clear form fields
    document.getElementById('songInput').value = '';
    document.getElementById('artistInput').value = '';
    document.getElementById('lyricsText').value = '';
    document.getElementById('formType').value = 'add';
  });

  describe('Form handler is wired up', () => {
    it('should prevent default browser form submission', () => {
      const prevented = submitForm('Test Song', 'Artist', 'Some lyrics');
      expect(prevented).toBe(true);
    });
  });

  describe('Data storage', () => {
    it('should save song to localStorage with correct structure', () => {
      submitForm('Amazing Grace', 'John Newton', 'Amazing grace how sweet the sound');

      const saved = JSON.parse(localStorage.getItem('Amazing Grace'));
      expect(saved).toEqual({
        artist: 'John Newton',
        lyrics: 'Amazing grace how sweet the sound',
        set: 1,
      });
    });

    it('should use the current set number', () => {
      window.currentSetNumber = 3;
      submitForm('Set 3 Song', 'Artist', 'Lyrics here');

      const saved = JSON.parse(localStorage.getItem('Set 3 Song'));
      expect(saved.set).toBe(3);
    });

    it('should allow saving without an artist', () => {
      submitForm('Traditional Song', '', 'Folk lyrics go here');

      const saved = JSON.parse(localStorage.getItem('Traditional Song'));
      expect(saved.artist).toBe('');
      expect(saved.lyrics).toBe('Folk lyrics go here');
    });

    it('should preserve multiline lyrics', () => {
      const multiline = 'Line one\nLine two\nLine three';
      submitForm('Multiline Song', 'Artist', multiline);

      const saved = JSON.parse(localStorage.getItem('Multiline Song'));
      expect(saved.lyrics).toBe(multiline);
    });

    it('should overwrite an existing song with the same title', () => {
      submitForm('My Song', 'Original Artist', 'Original lyrics');
      submitForm('My Song', 'Updated Artist', 'Updated lyrics');

      const saved = JSON.parse(localStorage.getItem('My Song'));
      expect(saved.artist).toBe('Updated Artist');
      expect(saved.lyrics).toBe('Updated lyrics');
    });
  });

  describe('Validation', () => {
    it('should not save when title is empty', () => {
      submitForm('', 'Artist', 'Some lyrics');
      expect(localStorage.getItem('')).toBeNull();
    });

    it('should not save when lyrics is empty', () => {
      submitForm('Song Title', 'Artist', '');
      expect(localStorage.getItem('Song Title')).toBeNull();
    });
  });

  describe('Post-save behaviour', () => {
    it('should call updateSongDropdown after a successful add', () => {
      submitForm('New Song', 'Artist', 'Lyrics');
      expect(window.updateSongDropdown).toHaveBeenCalled();
    });

    it('should reset the form fields after saving', () => {
      submitForm('Cleared Song', 'Artist', 'Lyrics');
      expect(document.getElementById('songInput').value).toBe('');
      expect(document.getElementById('lyricsText').value).toBe('');
    });
  });
});
