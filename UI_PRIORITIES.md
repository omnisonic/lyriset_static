# Lyriset UI Modernization Priorities

## Priority #1: Optimize for Largest Font Size Possible
**Goal**: Maximize font size while ensuring all lyrics fit on screen without overflow.

### Key Requirements:
1. **Column width determined by longest line**
   - Measure the longest line at reference font size (16px)
   - Calculate required column width: longest line + 20px buffer
   - **No line overflow within the column** - each line must fit completely

2. **Maximize font size**
   - Start with the largest possible font size (32px)
   - Test downwards until finding the optimal size that fits all content
   - Prioritize larger fonts over more columns

3. **Column constraints**
   - Maximum 4 columns on wide screens (≥1200px)
   - Maximum 3 columns on tablets (≥800px)
   - Maximum 2 columns on small tablets (≥600px)
   - Single column on phones (<600px)
   - Never create more columns than there are lines of lyrics

### Algorithm Logic:
1. **Determine column width**: Use the longest line width + 20px buffer
2. **Calculate max columns**: Container width / column width
3. **Apply constraints**: Limit columns based on screen size and line count
4. **Test font sizes**: Start at 32px, decrement by 0.5px
5. **Score each configuration**: 
   - Must have no vertical overflow (no scrollbar)
   - Must have no horizontal overflow
   - Must fit longest line in column width
   - Bonus for larger font sizes
   - Penalty for excessive columns
6. **Select best**: Highest score wins

## Priority #2: Readability & Modern Design
- Clean, minimalist interface
- Dark/light theme based on browser preference
- Smooth transitions and interactions
- Clear visual hierarchy

## Priority #3: Functionality Preservation
- All existing features must work
- Import/export must be maintained
- Keyboard shortcuts preserved
- Touch gestures supported

## Priority #4: Performance
- Fast auto-fit calculation
- Efficient DOM updates
- Minimal reflows
- Smooth animations

## Priority #5: Use Full Screen When Possible
- **Maximize both width and height** usage
- Remove all max-width constraints on containers
- Minimize header/footer space
- Optimize for large displays
- Use available screen real estate efficiently
- Ensure lyrics take up maximum visible area
- 100% width containers with minimal padding

## CSS Maintenance Notes
### Removed Mobile/Tablet Styles (2026-01-04)
**DO NOT RE-ADD**: Removed bottom margins and padding from `.lyrics div` styles in both tablet and mobile media queries:
- Removed: `margin-bottom: 0.9em;` (tablet) and `margin-bottom: 0.8em;` (mobile)
- Removed: `padding: 0.25em 0;` (tablet) and `padding: 0.2em 0;` (mobile)

These styles were creating unwanted spacing between lyric lines. The layout now relies solely on `line-height: 1.4` on the `.lyrics` container for proper line spacing.

### Mobile Font Size Calculation (2026-01-04)
**Mobile Requirement**: Font size must be calculated so that the longest line fits within the container width without overflow.

#### Problem Solved
Text lines were going outside the screen on mobile because font size wasn't being calculated properly to fit container width.

#### Solution Implementation

**JavaScript Auto-Fit Algorithm (Mobile):**
1. **Measure longest line** at reference font size (16px)
2. **Calculate optimal font size**: `(containerWidth * 0.9 / longestLineWidth) * 16px`
3. **Apply limits**: 12px minimum, 20px maximum
4. **Verify no vertical overflow** and reduce font size if needed

**CSS Text Wrapping (Backup):**
- Removed `white-space: nowrap` from base `.lyrics` class
- Added `white-space: normal`, `word-wrap: break-word`, `overflow-wrap: break-word` to mobile media queries
- Ensures long lines wrap if font size calculation isn't perfect

**Result:**
- ✅ No horizontal overflow (lines fit within container)
- ✅ No vertical overflow (no unwanted scrollbars)
- ✅ Maximum readable font size (12-20px range)
- ✅ Text wrapping as safety net
- ✅ Works on all mobile screen sizes

**Formula Details:**
- Container width: 100% minus padding (10px total)
- Target width: 90% of container (for breathing room)
- Reference font size: 16px (for measuring longest line)
- Calculation: `optimalFontSize = (targetWidth / longestLineWidth) * 16px`
- Limits applied: `max(12px, min(20px, optimalFontSize))`

**Safety Checks:**
- If vertical overflow occurs, reduce font size by 0.5px increments until it fits
- Text wrapping enabled as backup for edge cases
