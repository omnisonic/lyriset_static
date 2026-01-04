# Lyriset Agent - Auto-Fit Lyrics Display

## Project Overview

**Primary Goal**: Display lyrics of a song and automatically fit all lyrics to a single display screen.

**Current State**: Lyriset is a browser-based songbook application that displays lyrics in a 4-column layout. The current implementation uses fixed CSS columns and manual font size adjustment, which doesn't guarantee all lyrics will fit on a single screen.

**Target State**: Implement intelligent auto-fit functionality that dynamically adjusts layout parameters to ensure all lyrics of any song fit within the visible viewport without scrolling.

## Current Architecture Analysis

### Core Components

1. **Data Layer** (`js/lyrics_storage.js`)
   - localStorage-based song storage
   - Import/export functionality for .lyriset files
   - Default song loading from `data/lyrics_data_2025-02-14.lyriset`

2. **Display Layer** (`js/lyrics_app.js`)
   - `displayLyrics()`: Renders lyrics to DOM
   - `adjustFontSize()`: Manual font size control (+/- buttons)
   - `toggleCleanLyrics()`: Toggle between original/cleaned lyrics
   - Navigation: `loadNextSong()`, `loadPrevSong()`

3. **UI Layer** (`index.html`, `css/lyrics_app.css`)
   - Bootstrap-based responsive navigation
   - 4-column CSS layout using `column-count: 4`
   - Fixed viewport height calculations
   - Manual font size controls

### Current Layout Strategy
```css
.lyrics {
    column-count: 4;
    column-gap: 2em;
    height: 100%;
    white-space: pre-wrap;
    text-align: center;
}
```

## Implementation Plan

### Phase 1: Auto-Fit Algorithm Design

**Objective**: Create a function that calculates optimal layout parameters based on lyrics content and viewport size.

#### Key Variables to Consider:
- **Viewport dimensions**: Available screen real estate
- **Lyrics content**: Total character count, line count, average line length
- **Typography**: Font size, line height, character width
- **Layout**: Column count, column gap, padding
- **Constraints**: Minimum readable font size, maximum column count

#### Algorithm Steps:
1. **Measure viewport**: Get available width and height for lyrics container
2. **Analyze lyrics**: Calculate line count, average characters per line
3. **Initial estimation**: Start with reasonable defaults (e.g., 2-4 columns, 14px font)
4. **Iterative adjustment**:
   - Render lyrics with current parameters
   - Measure actual rendered height
   - If too tall: reduce columns or font size
   - If too short: increase columns or font size
   - Repeat until optimal fit achieved
5. **Apply constraints**: Ensure minimum font size (e.g., 10px) for readability

### Phase 2: Dynamic Layout Engine

**New Function**: `autoFitLyrics(song, artist, lyrics)`

```javascript
function autoFitLyrics(song, artist, lyrics) {
    // 1. Get viewport measurements
    const viewport = getLyricsViewport();
    
    // 2. Analyze lyrics content
    const analysis = analyzeLyrics(lyrics);
    
    // 3. Calculate optimal parameters
    const params = calculateOptimalLayout(viewport, analysis);
    
    // 4. Apply parameters and render
    applyLayoutParameters(params);
    displayLyrics(song, artist, lyrics);
    
    // 5. Store parameters for this song
    saveLayoutParams(song, params);
}
```

**Helper Functions**:
- `getLyricsViewport()`: Measure available container space
- `analyzeLyrics(lyrics)`: Extract metrics (lines, chars, structure)
- `calculateOptimalLayout(viewport, analysis)`: Core algorithm
- `applyLayoutParameters(params)`: Set CSS properties
- `saveLayoutParams(song, params)`: Persist for song

### Phase 3: CSS Modifications

**Current Issues**:
- Fixed `column-count: 4`
- No dynamic height adjustment
- Manual font size only

**Required Changes**:
```css
.lyrics {
    /* Remove fixed column count */
    column-count: var(--optimal-columns, 4);
    column-gap: var(--optimal-gap, 2em);
    font-size: var(--optimal-font-size, 16px);
    line-height: var(--optimal-line-height, 1.4);
    
    /* Ensure content fits */
    height: 100%;
    overflow: hidden;
    
    /* Responsive adjustments */
    break-inside: avoid;
    page-break-inside: avoid;
}

.lyrics-container {
    /* Allow dynamic height calculation */
    height: auto;
    max-height: 100%;
    overflow: hidden;
}
```

### Phase 4: Integration Points

**Current Flow**:
```
User selects song → displayLyrics() → Render to DOM
```

**New Flow**:
```
User selects song → autoFitLyrics() → Calculate params → displayLyrics() → Render with optimal layout
```

**Integration Strategy**:
1. Modify `displayLyrics()` to call `autoFitLyrics()` when lyrics change
2. Add parameter caching to avoid recalculation on every render
3. Preserve manual font size adjustment as override capability
4. Update navigation functions to trigger auto-fit

### Phase 5: Performance Optimization

**Challenges**:
- Auto-fit calculation requires DOM rendering and measurement
- Could cause layout thrashing if not handled properly
- Need to avoid blocking UI thread

**Solutions**:
1. **Debounced calculations**: Batch layout calculations
2. **RequestAnimationFrame**: Use browser's paint cycle
3. **Caching**: Store calculated params per song
4. **Progressive enhancement**: Start with reasonable defaults, refine asynchronously

## Technical Requirements

### Files to Modify

1. **`js/lyrics_app.js`**
   - Add `autoFitLyrics()` function
   - Add `calculateOptimalLayout()` algorithm
   - Add measurement helpers
   - Modify `displayLyrics()` to use auto-fit
   - Update `adjustFontSize()` to work with auto-fit

2. **`css/lyrics_app.css`**
   - Update `.lyrics` selector for dynamic variables
   - Add responsive breakpoints for auto-fit
   - Ensure proper container sizing

3. **`js/lyrics_storage.js`**
   - Extend storage to include layout parameters
   - Update import/export to include layout data

### New Dependencies
- None required (vanilla JavaScript)

### Browser Compatibility
- Modern browsers with CSS Custom Properties support
- ResizeObserver API for viewport monitoring
- localStorage for persistence

## Testing Strategy

### Unit Tests
- `calculateOptimalLayout()` with various inputs
- `analyzeLyrics()` accuracy
- Edge cases (empty lyrics, very long lines, etc.)

### Integration Tests
- Auto-fit with different song lengths
- Viewport size changes
- Font size manual override
- Navigation between songs

### Visual Tests
- Compare before/after on various devices
- Test with real song data
- Verify readability at different zoom levels

## Success Criteria

1. **Functional**: All lyrics fit within viewport without scrolling
2. **Readable**: Minimum font size maintained (≥10px)
3. **Responsive**: Works across device sizes (mobile to desktop)
4. **Performant**: Auto-fit calculation < 100ms
5. **User-friendly**: Manual controls still work, no breaking changes

## Implementation Order

1. ✅ **Analysis**: Understand current codebase (complete)
2. **Prototype**: Build auto-fit algorithm in isolation
3. **Integration**: Connect to existing display system
4. **Refinement**: Optimize performance and edge cases
5. **Testing**: Validate across scenarios
6. **Documentation**: Update user guides

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Layout thrashing | High | Use RAF, batch measurements |
| Complex algorithm | Medium | Start simple, iterate |
| Breaking existing features | High | Maintain backward compatibility |
| Performance on large lyrics | Medium | Implement caching, lazy calculation |

## Next Steps

1. Create prototype of auto-fit algorithm
2. Test with sample lyrics data
3. Integrate into main application
4. Add user controls for fine-tuning
5. Document usage and limitations
