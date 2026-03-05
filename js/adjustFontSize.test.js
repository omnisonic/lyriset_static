// adjustFontSize.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { adjustFontSize } from './lyrics_app.js';

// Mock DOM elements
const createMockDOM = () => {
  document.body.innerHTML = `
    <div id="songTitle">Test Song</div>
    <div id="lyricsDisplay" style="font-size: 16px; width: 800px;"></div>
  `;
};

describe('adjustFontSize', () => {
  beforeEach(() => {
    createMockDOM();
    // Mock calculateUnusedSpace to avoid DOM complexity
    window.calculateUnusedSpace = vi.fn();
    // Use fake timers to control setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('Desktop (width >= 769px)', () => {
    beforeEach(() => {
      // Set desktop width
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      Object.defineProperty(lyricsDisplay, 'offsetWidth', { value: 800, writable: true });
    });

    it('should increase font size by 1 when delta is positive', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '16px';

      adjustFontSize(1);

      expect(lyricsDisplay.style.fontSize).toBe('17px');
    });

    it('should decrease font size by 1 when delta is negative', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '16px';

      adjustFontSize(-1);

      expect(lyricsDisplay.style.fontSize).toBe('15px');
    });

    it('should not exceed maximum font size (32px)', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '31px';

      adjustFontSize(5); // Would be 36px, but should cap at 32px

      expect(lyricsDisplay.style.fontSize).toBe('32px');
    });

    it('should not go below minimum font size (8px)', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '9px';

      adjustFontSize(-5); // Would be 4px, but should floor at 8px

      expect(lyricsDisplay.style.fontSize).toBe('8px');
    });

    it('should call calculateUnusedSpace after adjustment', () => {
      adjustFontSize(1);
      vi.runAllTimers();
      expect(window.calculateUnusedSpace).toHaveBeenCalled();
    });

    it('should do nothing if no song is selected', () => {
      document.getElementById('songTitle').textContent = 'Select a Song';
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      const originalSize = lyricsDisplay.style.fontSize;

      adjustFontSize(1);

      expect(lyricsDisplay.style.fontSize).toBe(originalSize);
      expect(window.calculateUnusedSpace).not.toHaveBeenCalled();
    });
  });

  describe('Mobile (width < 769px)', () => {
    beforeEach(() => {
      // Set mobile width
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      Object.defineProperty(lyricsDisplay, 'offsetWidth', { value: 375, writable: true });
    });

    it('should increase font size by 1 when delta is positive', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '14px';

      adjustFontSize(1);

      expect(lyricsDisplay.style.fontSize).toBe('15px');
    });

    it('should decrease font size by 1 when delta is negative', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '14px';

      adjustFontSize(-1);

      expect(lyricsDisplay.style.fontSize).toBe('13px');
    });

    it('should not exceed mobile maximum font size (20px)', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '19px';

      adjustFontSize(5); // Would be 24px, but should cap at 20px

      expect(lyricsDisplay.style.fontSize).toBe('20px');
    });

    it('should not go below mobile minimum font size (12px)', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '13px';

      adjustFontSize(-5); // Would be 8px, but should floor at 12px

      expect(lyricsDisplay.style.fontSize).toBe('12px');
    });

    it('should call calculateUnusedSpace after adjustment', () => {
      adjustFontSize(1);
      vi.runAllTimers();
      expect(window.calculateUnusedSpace).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      // Set desktop width for edge cases to ensure consistent behavior
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      Object.defineProperty(lyricsDisplay, 'offsetWidth', { value: 800, writable: true });
    });

    it('should handle missing lyricsDisplay element', () => {
      document.body.innerHTML = '<div id="songTitle">Test Song</div>';
      
      expect(() => adjustFontSize(1)).not.toThrow();
      expect(window.calculateUnusedSpace).not.toHaveBeenCalled();
    });

    it('should handle missing songTitle element', () => {
      document.body.innerHTML = '<div id="lyricsDisplay" style="font-size: 16px;"></div>';

      expect(() => adjustFontSize(1)).not.toThrow();
      vi.runAllTimers();
      expect(window.calculateUnusedSpace).not.toHaveBeenCalled();
    });

    it('should handle zero delta', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '16px';

      adjustFontSize(0);

      expect(lyricsDisplay.style.fontSize).toBe('16px');
    });

    it('should handle large positive delta', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '16px';

      adjustFontSize(100);

      expect(lyricsDisplay.style.fontSize).toBe('32px'); // Desktop max
    });

    it('should handle large negative delta', () => {
      const lyricsDisplay = document.getElementById('lyricsDisplay');
      lyricsDisplay.style.fontSize = '16px';

      adjustFontSize(-100);

      expect(lyricsDisplay.style.fontSize).toBe('8px'); // Desktop min
    });
  });
});