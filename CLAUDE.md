# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lyriset** is a browser-based songbook and setlist application for gigging singers. It displays lyrics in a responsive layout with automatic font size and column optimization to ensure all lyrics fit on a single screen without scrolling.

**Core Goal**: Display lyrics and automatically fit them to the viewport using an intelligent auto-fit algorithm.

## Project Structure

```
lyriset_static/
├── index.html                 # Main HTML with Bootstrap UI and modal dialogs
├── css/lyrics_app.css         # Styling with CSS variables for theming
├── js/
│   ├── lyrics_app.js          # Main app logic - auto-fit, display, navigation
│   ├── lyrics_storage.js      # localStorage management and import/export
│   ├── clean_lyrics.js        # Lyrics cleaning/filtering functionality
│   ├── theme_toggle.js        # Theme switching (light/dark/custom)
│   ├── reset_autofit.js       # Reset auto-fit functionality
│   ├── edit.js                # Edit song functionality
│   ├── adjustFontSize.test.js # Auto-fit algorithm tests
│   ├── cleanLyrics.test.js    # Lyrics cleaning tests
│   └── navigation.test.js     # Navigation tests
├── data/lyrics_data_*.lyriset # Default song data (JSON format)
├── theme_config.js            # Theme manager with multiple color schemes
├── theme_config.js            # Theme configuration and manager
├── sw.js                      # Service worker for PWA/offline support
├── manifest.json              # PWA manifest
├── package.json               # Test configuration
├── vitest.config.js           # Vitest testing framework config
└── archive/                   # Legacy/old code implementations
```

## Key Files and Responsibilities

### `js/lyrics_app.js` - Core Application Logic
- **`autoFitLyrics()`**: Main auto-fit algorithm that calculates optimal font size and column layout
- **`displayLyrics()`**: Renders lyrics to DOM with title and artist
- **`adjustColumnsForFontSize()`**: Adjusts column count based on font size (desktop only)
- **`toggleAutoScroll()` / `startAutoScroll()`**: iOS-optimized auto-scroll for mobile
- **`toggleCleanLyrics()`**: Toggles between original and cleaned lyrics
- **`loadNextSong()` / `loadPrevSong()`**: Navigation between songs
- **Helper functions**: `getLongestLineWidth()`, `calculateUnusedSpace()`

**Auto-fit Algorithm Flow**:
1. Detect device type (mobile vs desktop)
2. **Mobile**: Uses vertical scrolling with optimized font size
3. **Desktop**: Tests font sizes (32px → 8px) with dynamic column adjustment
4. Scores each configuration based on: no scrollbar, no horizontal overflow, line fits in column, column count, font size
5. Applies best configuration

### `js/lyrics_storage.js` - Data Management
- **`loadDefaultSongs()`**: Loads default songs from `data/lyrics_data_*.lyriset`
- **`updateSongDropdown()`**: Updates song selector by set number
- **`exportSongData()`**: Exports all songs to .lyriset JSON file
- **`importSongData()`**: Imports songs from file input
- **`deleteSong()`**: Removes song from localStorage
- **`saveLastViewedSong()` / `loadLastViewedSong()`**: Persistence of current song

**Storage Keys**:
- `{song_title}`: Song data JSON
- `lastViewedSong`: Last displayed song title
- `theme-preference`: User theme choice
- `lyrics-font-size-{song}`: Per-song font size (deprecated in favor of auto-fit)

### `js/clean_lyrics.js` - Lyrics Cleaning
- **`cleanLyrics()`**: Removes chords, metadata, and formatting noise
- **Filters out**: Chord lines (detected by regex), metadata with `:`, `()`, `#`, symbol-only lines
- **Preserves**: Lyrics content with at least 3 alphabetic characters, single blank lines for structure

### `js/theme_config.js` - Theme System
- **ThemeConfig**: Configuration object with 6 built-in themes (default, dark, warm, cool, midnight, forest)
- **`ThemeManager` class**: Handles theme application, persistence, and switching
- **CSS Variables**: `--bg-primary`, `--text-primary`, `--button-bg`, etc.
- **Features**: Auto-detect system preference, localStorage persistence, custom themes

### `css/lyrics_app.css` - Styling
- **CSS Variables**: Theme system using custom properties
- **Responsive Layout**: Mobile-first with breakpoints at 769px (tablet) and 992px (desktop)
- **Auto-fit Support**: Uses `--optimal-*` variables for dynamic layout
- **Dark Mode**: Uses `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`

## Testing

**Vitest** is used for testing with jsdom environment.

### Test Files
- **`js/adjustFontSize.test.js`**: Auto-fit algorithm edge cases and scoring
- **`js/cleanLyrics.test.js`**: Lyrics cleaning with various input formats
- **`js/navigation.test.js`**: Song navigation between sets

### Commands
```bash
npm test              # Run all tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run with UI interface
npm run test:coverage # Run with coverage report
npm run test:watch    # Run in watch mode
```

## Development Workflow

### Running the App
1. Open `index.html` in a local web server (some features like PWA require HTTPS/localhost)
2. For testing PWA features: `npx serve` or similar
3. The app auto-loads default songs from `data/lyrics_data_2026-01-05.lyriset`

### Adding New Songs
1. Use the **+** button in navbar to open "Add Song" modal
2. Or edit `data/lyrics_data_*.lyriset` and reload
3. Format: `{"Song Title": {"artist": "...", "lyrics": "...", "set": 1}}`

### Modifying Auto-Fit Algorithm
The main algorithm is in `js/lyrics_app.js` starting around line 560. Key parameters:
- **Mobile**: Font size 14-32px, vertical layout
- **Desktop**: Font size 8-32px, 1-6 columns
- **Scoring**: Based on overflow, line fitting, column count, font size

### Testing Changes
1. Add test cases to appropriate test file
2. Run `npm test` to verify
3. Check coverage with `npm run test:coverage`

## PWA and Deployment

### Files Required
- `sw.js` - Service worker for offline caching
- `manifest.json` - App metadata
- Icons: `icon-180.png`, `icon-192.png`, `icon-512.png`
- `index.html` has iOS PWA meta tags

### Deployment
- Use HTTPS (required for PWA features)
- GitHub Pages, Netlify, or Vercel work
- See `DEPLOYMENT_GUIDE.md` for detailed steps

## Key Integration Points

### When Displaying Lyrics
```
User selects song → updateSongDropdown() → autoFitLyrics() → displayLyrics()
```

### Auto-Fit Trigger Points
- Song selection from dropdown
- Next/Previous navigation
- Toggle clean lyrics
- Manual font size adjustment (as override)

### Data Flow
```
Import/Default → localStorage → parse JSON → autoFitLyrics → render
```

## Important Considerations

### Browser Compatibility
- Modern browsers with CSS Custom Properties
- ResizeObserver for viewport monitoring (mobile detection)
- localStorage for persistence
- Bootstrap 5.3.8 for UI components

### Performance
- Auto-fit runs with 200ms delay to ensure DOM ready
- Algorithm iterates font sizes (32px → 8px, 0.5px steps)
- Results cached per-song in localStorage
- Mobile uses simpler vertical layout for speed

### iOS Specifics
- Touch event handling for smooth scrolling
- `touch-action: manipulation` to prevent zoom
- Auto-scroll uses `scrollTop` for compatibility
- Standalone app mode via PWA

## Common Tasks

### Fix a bug in auto-fit
1. Locate function in `js/lyrics_app.js` (likely `autoFitLyrics` or helper)
2. Add test case to `adjustFontSize.test.js`
3. Run tests to verify fix

### Add new theme
1. Add to `ThemeConfig` in `theme_config.js`
2. Update CSS variables if needed in `css/lyrics_app.css`
3. Update `THEME_README.md` documentation

### Change layout from 4-column to responsive
1. Modify `adjustColumnsForFontSize()` in `js/lyrics_app.js`
2. Update CSS in `css/lyrics_app.css` for responsive breakpoints
3. Test on mobile and desktop

### Clean lyrics differently
1. Modify `cleanLyrics()` in `js/clean_lyrics.js`
2. Add test cases to `cleanLyrics.test.js`
3. Run tests to ensure no regressions
