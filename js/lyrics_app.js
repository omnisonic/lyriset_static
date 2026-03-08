import { cleanLyrics } from './clean_lyrics.js';
import { extractChords, renderChordSummary } from './chord_diagrams.js';

// Auto-scroll functionality for mobile
let autoScrollInterval = null;
let autoScrollActive = false;
let chordDiagramsMode = 'guitar'; // 'off' | 'guitar' | 'ukulele'

function toggleAutoScroll() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    const autoScrollButton = document.getElementById('autoScrollButton');
    const autoScrollText = document.getElementById('autoScrollText');
    
    if (!lyricsContainer) {
        return;
    }
    
    // Check if we're on mobile/tablet
    const containerWidth = lyricsContainer.offsetWidth;
    if (containerWidth >= 480) {
        return;
    }
    
    const song = document.getElementById('songTitle').textContent;
    if (!song || song === 'Select a Song') {
        return;
    }
    
    if (autoScrollActive) {
        // Stop auto-scroll
        stopAutoScroll();
        autoScrollText.className = 'bi bi-play-fill';
        autoScrollButton.classList.remove('active');
    } else {
        // Start auto-scroll
        startAutoScroll();
        autoScrollText.className = 'bi bi-pause-fill';
        autoScrollButton.classList.add('active');
    }
}

function startAutoScroll() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        return;
    }
    
    // Stop any existing scroll
    stopAutoScroll();
    
    autoScrollActive = true;
    
    // Find the actual scrollable container
    // The structure is: .lyrics-container > .lyrics > divs
    // We need to scroll the .lyrics-container
    const scrollContainer = document.querySelector('.lyrics-container');
    if (!scrollContainer) {
        return;
    }
    
    // Continuous scroll function optimized for iOS
    const scrollStep = () => {
        if (!autoScrollActive) return;
        
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const currentScroll = scrollContainer.scrollTop;
        
        if (maxScroll <= 0) {
            stopAutoScroll();
            return;
        }
        
        if (currentScroll >= maxScroll - 2) {
            stopAutoScroll();
            return;
        }
        
        // For iOS, use smaller increments with native scrolling
        // This works better with iOS's scroll system
        const scrollAmount = 1; // Smaller step for smoother iOS scrolling
        
        // Use scrollTop for better iOS compatibility
        scrollContainer.scrollTop += scrollAmount;
        
        // Continue scrolling with short interval
        autoScrollInterval = setTimeout(scrollStep, 50);
    };
    
    // Start scrolling
    scrollStep();
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearTimeout(autoScrollInterval);
        autoScrollInterval = null;
    }
    autoScrollActive = false;
}

function insertChordSummary(lyrics) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) return;
    document.getElementById('chordSummary')?.remove();
    const chords = extractChords(lyrics);
    const html = renderChordSummary(chords, chordDiagramsMode);
    if (!html) return;
    const div = document.createElement('div');
    div.innerHTML = html;
    const isMobile = (lyricsContainer.parentNode.offsetWidth || window.innerWidth) < 480;
    if (isMobile) {
        lyricsContainer.parentNode.insertBefore(div.firstElementChild, lyricsContainer);
    } else {
        lyricsContainer.prepend(div.firstElementChild);
    }
}

const CHORD_MODE_CYCLE = ['off', 'guitar', 'ukulele'];
const CHORD_MODE_TITLES = { off: 'Chord Diagrams', guitar: 'Guitar Chords', ukulele: 'Ukulele Chords' };

function toggleChordDiagrams() {
    const nextIndex = (CHORD_MODE_CYCLE.indexOf(chordDiagramsMode) + 1) % CHORD_MODE_CYCLE.length;
    chordDiagramsMode = CHORD_MODE_CYCLE[nextIndex];
    const btn = document.getElementById('toggleChordDiagramsButton');

    if (chordDiagramsMode !== 'off') {
        btn?.classList.add('active');
        btn?.setAttribute('title', CHORD_MODE_TITLES[chordDiagramsMode]);
        const lyrics = document.getElementById('lyricsDisplay')?.getAttribute('data-original-lyrics');
        if (lyrics) insertChordSummary(lyrics);
    } else {
        btn?.classList.remove('active');
        btn?.setAttribute('title', CHORD_MODE_TITLES.off);
        document.getElementById('chordSummary')?.remove();
    }
}

function toggleCleanLyrics() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    const toggleButton = document.getElementById('toggleCleanLyricsButton');
    const toggleText = document.getElementById('toggleCleanLyricsText');
    
    if (!lyricsContainer) {
        return;
    }
    
    const originalLyrics = lyricsContainer.getAttribute('data-original-lyrics');
    const isClean = lyricsContainer.getAttribute('data-clean') === 'true';
    
    if (!originalLyrics) {
        return;
    }

    const song = document.getElementById('songTitle').textContent;
    const artist = document.getElementById('songArtist').textContent;
    
    // Stop auto-scroll when toggling lyrics
    stopAutoScroll();
    const autoScrollButton = document.getElementById('autoScrollButton');
    const autoScrollText = document.getElementById('autoScrollText');
    if (autoScrollButton && autoScrollText) {
        autoScrollText.className = 'bi bi-play-fill';
        autoScrollButton.classList.remove('active');
    }
    
    if (isClean) {
        // Switching back to original lyrics
        if (typeof autoFitLyrics === 'function') {
            autoFitLyrics(song, artist, originalLyrics);
        } else {
            displayLyrics(song, artist, originalLyrics);
        }
        toggleText.className = 'bi bi-stars';
        toggleButton.classList.add('active');
        lyricsContainer.setAttribute('data-clean', 'false');
    } else {
        // Switching to cleaned lyrics
        const cleanedLyrics = cleanLyrics(originalLyrics);
        if (cleanedLyrics) {
            if (typeof autoFitLyrics === 'function') {
                autoFitLyrics(song, artist, cleanedLyrics);
            } else {
                displayLyrics(song, artist, cleanedLyrics);
            }
            toggleText.className = 'bi bi-stars';
            toggleButton.classList.remove('active');
            lyricsContainer.setAttribute('data-clean', 'true');
        }
    }
    
    // Ensure layout is adjusted after toggle
    setTimeout(() => {
        const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        const containerWidth = lyricsContainer.offsetWidth;
        
        // Only adjust columns on desktop (mobile uses vertical scrolling)
        if (containerWidth >= 480) {
            adjustColumnsForFontSize(currentSize);
        }
        calculateUnusedSpace();
    }, 150);
}
    
export function loadNextSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    const songs = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size' && key !== 'lastViewedSong' && key !== 'theme-preference') {
            try {
                const item = localStorage.getItem(key);
                if (item) {
                    const songData = JSON.parse(item);
                    if (songData && songData.set === window.currentSetNumber) {
                        songs.push(key);
                    }
                }
            } catch (e) {
                // Skip items that aren't valid JSON
                continue;
            }
        }
    }
    
    if (songs.length === 0) return;
    
    songs.sort();
    
    const currentIndex = songs.indexOf(currentSong);
    const nextIndex = currentIndex === songs.length - 1 ? 0 : currentIndex + 1;
    const nextSong = songs[nextIndex];
    try {
        const songData = JSON.parse(localStorage.getItem(nextSong));
        if (songData) {
            const fn = window.autoFitLyrics || autoFitLyrics;
            fn(nextSong, songData.artist, songData.lyrics);
        }
    } catch (e) {
        // Error loading next song
    }
}

export function loadPrevSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    const songs = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size' && key !== 'lastViewedSong' && key !== 'theme-preference') {
            try {
                const item = localStorage.getItem(key);
                if (item) {
                    const songData = JSON.parse(item);
                    if (songData && songData.set === window.currentSetNumber) {
                        songs.push(key);
                    }
                }
            } catch (e) {
                // Skip items that aren't valid JSON
                continue;
            }
        }
    }
    
    if (songs.length === 0) return;
    
    songs.sort();
    
    const currentIndex = songs.indexOf(currentSong);
    const prevIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;
    const prevSong = songs[prevIndex];
    
    try {
        const songData = JSON.parse(localStorage.getItem(prevSong));
        if (songData) {
            const fn = window.autoFitLyrics || autoFitLyrics;
            fn(prevSong, songData.artist, songData.lyrics);
        }
    } catch (e) {
        // Error loading previous song
    }
}
    
export function adjustFontSize(delta) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        return;
    }

    const songTitle = document.getElementById('songTitle');
    if (!songTitle) {
        return;
    }
    const song = songTitle.textContent;
    if (!song || song === 'Select a Song') {
        return;
    }
    
    const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
    const containerWidth = lyricsContainer.offsetWidth;
    
    // Mobile: Use smaller font size range
    if (containerWidth < 480) {
        const newSize = Math.min(Math.max(currentSize + delta, 12), 20);
        lyricsContainer.style.fontSize = `${newSize}px`;
    } else {
        // Desktop: Use larger font size range
        const newSize = Math.min(Math.max(currentSize + delta, 8), 32);
        lyricsContainer.style.fontSize = `${newSize}px`;
        
        // Get longest line with current font size to check if adjustment is needed
        const longestLine = getLongestLineWidth(lyricsContainer, newSize);
        
        // Adjust column count based on new font size to prevent line wrapping
        adjustColumnsForFontSize(newSize);
    }
    
    // Recalculate space after a brief delay to allow DOM to update
    setTimeout(() => {
        const fn = window.calculateUnusedSpace || calculateUnusedSpace;
        fn();
    }, 100);
}

// Helper function to find the longest line width
function getLongestLineWidth(lyricsContainer, fontSize) {
    const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
    let longestLineWidth = 0;
    let longestLineText = '';
    
    lineDivs.forEach(div => {
        if (div.textContent && div.textContent.trim()) {
            // Create a temporary span to measure the exact width of the text
            const span = document.createElement('span');
            span.style.visibility = 'hidden';
            span.style.position = 'absolute';
            span.style.whiteSpace = 'nowrap';
            span.style.font = window.getComputedStyle(div).font;
            span.style.fontSize = fontSize + 'px';
            span.textContent = div.textContent;
            document.body.appendChild(span);
            
            const textWidth = span.offsetWidth;
            if (textWidth > longestLineWidth) {
                longestLineWidth = textWidth;
                longestLineText = div.textContent;
            }
            
            document.body.removeChild(span);
        }
    });
    
    return { width: longestLineWidth, text: longestLineText };
}

function adjustColumnsForFontSize(fontSize) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) return;
    
    // Check if we're on mobile/tablet (vertical scrolling layout)
    const containerWidth = lyricsContainer.offsetWidth;
    if (containerWidth < 480) {
        // Mobile/tablet layout - no columns needed, use vertical scrolling
        return;
    }
    
    // Desktop: Use column-based layout
    // Find the longest line of text to determine minimum column width
    const longestLine = getLongestLineWidth(lyricsContainer, fontSize);
    
    // Add some padding to the longest line width
    const requiredColumnWidth = longestLine.width + 20; // 20px buffer
    
    // Calculate how many columns can fit
    const maxColumns = Math.floor(containerWidth / requiredColumnWidth);
    
    // Ensure at least 1 column
    let targetColumns = Math.max(1, maxColumns);
    
    // CRITICAL: Never allow more columns than we have lines
    // This prevents unnecessary columns and line wrapping
    const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
    const totalLines = lineDivs.length;
    
    // Limit columns to actual number of lines to prevent empty columns
    if (totalLines > 0) {
        targetColumns = Math.min(targetColumns, totalLines);
    }
    
    // Apply reasonable upper limits based on container width
    // These are hard limits to prevent excessive columns
    if (containerWidth >= 1200) {
        targetColumns = Math.min(targetColumns, 4); // Max 4 columns on wide screens
    } else if (containerWidth >= 800) {
        targetColumns = Math.min(targetColumns, 3); // Max 3 columns on tablets
    } else if (containerWidth >= 600) {
        targetColumns = Math.min(targetColumns, 2); // Max 2 columns on small tablets
    } else {
        targetColumns = 1; // Single column on phones
    }
    
    // Ensure the longest line fits in a column without wrapping
    // This is the key to preserving original lines
    const columnGap = parseFloat(window.getComputedStyle(lyricsContainer).columnGap) || 0;
    const availableColumnWidth = (containerWidth - (targetColumns - 1) * columnGap) / targetColumns;
    
    // CRITICAL FIX: If the longest line doesn't fit, we MUST reduce columns until it does
    // This prevents text overlap
    while (targetColumns > 1 && longestLine.width > availableColumnWidth) {
        targetColumns--;
        // Recalculate available width for the new column count
        const newAvailableWidth = (containerWidth - (targetColumns - 1) * columnGap) / targetColumns;
        
        // If even 1 column can't fit the line, we need to use 1 column
        // The line will be wider than the container, but that's better than overlap
        if (targetColumns === 1) {
            break;
        }
    }
    
    // Apply the column count
    lyricsContainer.style.columnCount = targetColumns;
    
    // Final verification: calculate actual column width after applying
    const finalColumnGap = parseFloat(window.getComputedStyle(lyricsContainer).columnGap) || 0;
    const finalColumnWidth = (containerWidth - (targetColumns - 1) * finalColumnGap) / targetColumns;
    
    // Recalculate space after adjustment
    setTimeout(() => {
        calculateUnusedSpace();
    }, 50);
}

function calculateUnusedSpace() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    const lyricsMain = document.querySelector('.lyrics-main');
    const lyricsContainerWrapper = document.querySelector('.lyrics-container');
    
    if (!lyricsContainer || !lyricsMain || !lyricsContainerWrapper) {
        return;
    }

    // Get computed styles
    const computedStyle = window.getComputedStyle(lyricsContainer);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight) || (fontSize * 1.2);
    const columnCount = parseInt(computedStyle.columnCount) || 1;
    const columnGap = parseFloat(computedStyle.columnGap) || 0;
    const padding = parseFloat(computedStyle.padding) || 0;
    
    // Get container dimensions
    const containerRect = lyricsContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Check if we're on mobile/tablet (vertical scrolling layout)
    const isMobile = containerWidth < 480;
    
    if (isMobile) {
        // Mobile: Vertical scrolling layout - simpler calculation
        const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
        
        // Calculate total lines and their combined height
        let totalLines = 0;
        let totalHeight = 0;
        
        lineDivs.forEach(div => {
            if (div.textContent && div.textContent.trim()) {
                totalLines++;
                totalHeight += div.offsetHeight;
            }
        });
        
        // Calculate unused vertical space
        const usedSpace = totalHeight;
        const availableSpace = containerHeight;
        const unusedSpace = Math.max(0, availableSpace - usedSpace);
        
        return {
            lineHeight: lineHeight,
            totalLines: totalLines,
            hasWrappedLines: false, // Mobile doesn't wrap in columns
            linesPerColumn: [totalLines], // All lines in one "column"
            availableLinesPerColumn: Math.floor(containerHeight / lineHeight),
            linesInLastColumn: totalLines,
            lastTextColumnIndex: 0,
            emptyLinesAfterText: Math.floor(unusedSpace / lineHeight),
            emptyLines: Math.floor(unusedSpace / lineHeight),
            columns: 1,
            columnWidth: containerWidth,
            fontSize: fontSize,
            longestLine: getLongestLineWidth(lyricsContainer, fontSize)
        };
    }
    
    // Desktop: Column-based layout (original logic)
    // Calculate column width (accounting for gaps and padding)
    const columnWidth = (containerWidth - (columnCount - 1) * columnGap - (padding * 2)) / columnCount;
    
    // Get longest line information
    const longestLine = getLongestLineWidth(lyricsContainer, fontSize);
    
    // Get all line divs
    const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
    
    // Calculate actual rendered lines (including wrapped lines)
    let totalRenderedLines = 0;
    let actualLineHeight = lineHeight;
    let hasWrappedLines = false;
    
    lineDivs.forEach(div => {
        if (div.textContent && div.textContent.trim()) {
            const divHeight = div.offsetHeight;
            const linesInDiv = Math.max(1, Math.round(divHeight / lineHeight));
            totalRenderedLines += linesInDiv;
            
            // Check if this div has wrapped lines
            if (linesInDiv > 1) {
                hasWrappedLines = true;
            }
            
            // Get actual line height from first line if possible
            if (actualLineHeight === lineHeight && divHeight > 0) {
                actualLineHeight = divHeight / linesInDiv;
            }
        }
    });
    
    // Calculate available line capacity per column
    const availableLinesPerColumn = Math.floor(containerHeight / actualLineHeight);
    
    // With column-fill: auto, text fills columns sequentially
    // Calculate how many full columns are filled
    const fullColumns = Math.floor(totalRenderedLines / availableLinesPerColumn);
    const linesInLastColumn = totalRenderedLines % availableLinesPerColumn;
    
    // Calculate the actual column where the last text line appears
    const lastTextColumnIndex = (linesInLastColumn > 0) ? fullColumns : fullColumns - 1;
    
    // Calculate empty lines only after the final text line
    const emptyLinesAfterText = linesInLastColumn > 0 ? (availableLinesPerColumn - linesInLastColumn) : 0;
    
    // Calculate total empty lines across all columns after the last text line
    const emptyColumnsAfterText = columnCount - (fullColumns + (linesInLastColumn > 0 ? 1 : 0));
    const emptyLines = emptyLinesAfterText + (emptyColumnsAfterText * availableLinesPerColumn);
    
    // For display purposes, calculate lines per column (sequential distribution)
    const linesPerColumn = [];
    for (let i = 0; i < columnCount; i++) {
        if (i < fullColumns) {
            linesPerColumn.push(availableLinesPerColumn);
        } else if (i === fullColumns && linesInLastColumn > 0) {
            linesPerColumn.push(linesInLastColumn);
        } else {
            linesPerColumn.push(0);
        }
    }
    
    return {
        lineHeight: actualLineHeight,
        totalLines: totalRenderedLines,
        hasWrappedLines: hasWrappedLines,
        linesPerColumn: linesPerColumn,
        availableLinesPerColumn: availableLinesPerColumn,
        linesInLastColumn: linesInLastColumn,
        lastTextColumnIndex: lastTextColumnIndex,
        emptyLinesAfterText: emptyLinesAfterText,
        emptyLines: emptyLines,
        columns: columnCount,
        columnWidth: columnWidth,
        fontSize: fontSize,
        longestLine: longestLine
    };
}

// Auto-fit functionality - finds maximum font size without vertical overflow
// Uses overflow-y: auto to detect when font is too large
function autoFitLyrics(song, artist, lyrics, skipDisplay = false) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        return;
    }

    // On resize we skip re-rendering (content unchanged, just recalculate sizing)
    if (!skipDisplay) {
        displayLyrics(song, artist, lyrics);
    }

    // Show loading state while auto-fit calculates
    lyricsContainer.classList.add('autofit-calculating');

    // Wait for DOM to update
    setTimeout(() => {
        // Get container dimensions
        const containerHeight = lyricsContainer.clientHeight;
        const containerWidth = lyricsContainer.offsetWidth;
        
        if (containerHeight === 0) {
            return;
        }

        // Check if we're on mobile/tablet (vertical scrolling layout)
        const isMobile = containerWidth < 480;
        
        if (isMobile) {
            // Mobile/tablet: Calculate font size so longest line fits container width
            
            // Get container width (accounting for padding)
            const containerStyle = window.getComputedStyle(lyricsContainer);
            const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
            const containerWidth = lyricsContainer.clientWidth - paddingLeft - paddingRight;
            
            // Measure longest line at reference font size (16px)
            const referenceFontSize = 16;
            lyricsContainer.style.fontSize = `${referenceFontSize}px`;
            const forceReflow = lyricsContainer.offsetHeight;
            
            const longestLine = getLongestLineWidth(lyricsContainer, referenceFontSize);
            
            // Calculate optimal font size to fit longest line in container
            // Use 90% of container width for some breathing room
            const targetWidth = containerWidth * 0.9;
            let optimalFontSize = (targetWidth / longestLine.width) * referenceFontSize;
            
            // Apply limits
            const minFontSize = 12;
            const maxFontSize = 20;
            optimalFontSize = Math.max(minFontSize, Math.min(maxFontSize, optimalFontSize));
            
            // Apply the calculated font size
            lyricsContainer.style.fontSize = `${optimalFontSize}px`;
            
            // Verify no vertical overflow
            const verifyReflow = lyricsContainer.offsetHeight;
            const scrollHeight = lyricsContainer.scrollHeight;
            const clientHeight = lyricsContainer.clientHeight;
            const hasVerticalScrollbar = scrollHeight > clientHeight;
            
            if (hasVerticalScrollbar) {
                // If vertical overflow, reduce font size until it fits
                let adjustedSize = optimalFontSize;
                while (adjustedSize > minFontSize && hasVerticalScrollbar) {
                    adjustedSize -= 0.5;
                    lyricsContainer.style.fontSize = `${adjustedSize}px`;
                    const newReflow = lyricsContainer.offsetHeight;
                    const newScrollHeight = lyricsContainer.scrollHeight;
                    const newClientHeight = lyricsContainer.clientHeight;
                    if (newScrollHeight <= newClientHeight) {
                        break;
                    }
                }
                optimalFontSize = adjustedSize;
            }
            
            // Update status indicator if available
            if (typeof updateAutoFitStatus === 'function') {
                updateAutoFitStatus(true);
            }

            lyricsContainer.classList.remove('autofit-calculating');
            return; // Skip desktop column calculations
        }
        
        // Desktop: Use column-based layout with binary search for efficiency
        // Binary search reduces iterations from ~49 to ~7 vs the old linear scan.
        const minFontSize = 8;
        const maxFontSize = 32;
        const stepSize = 0.5;

        // Returns true if the given font size produces a valid (non-overflowing) layout
        function testFontSize(size) {
            lyricsContainer.style.fontSize = `${size}px`;
            adjustColumnsForFontSize(size);
            const forceReflow = lyricsContainer.offsetHeight;

            const hasScrollbar = lyricsContainer.scrollHeight > lyricsContainer.clientHeight;
            const hasHorizontalOverflow = lyricsContainer.scrollWidth > lyricsContainer.clientWidth;

            const currentColumnCount = parseInt(window.getComputedStyle(lyricsContainer).columnCount) || 1;
            const columnGap = parseFloat(window.getComputedStyle(lyricsContainer).columnGap) || 0;
            const columnWidth = (containerWidth - (currentColumnCount - 1) * columnGap) / currentColumnCount;
            const longestLine = getLongestLineWidth(lyricsContainer, size);
            const lineFitsInColumn = longestLine.width <= columnWidth;
            const columnCountOk = currentColumnCount >= 1 && currentColumnCount <= 6;

            return !hasScrollbar && !hasHorizontalOverflow && lineFitsInColumn && columnCountOk;
        }

        // Binary search for the largest valid font size (~7 iterations)
        const totalSteps = Math.round((maxFontSize - minFontSize) / stepSize); // 48
        let lo = 0, hi = totalSteps, bestIndex = -1;
        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            const size = minFontSize + mid * stepSize;
            if (testFontSize(size)) {
                bestIndex = mid;
                lo = mid + 1; // try larger
            } else {
                hi = mid - 1; // try smaller
            }
        }

        let bestSize = bestIndex >= 0 ? minFontSize + bestIndex * stepSize : minFontSize;
        
        // Apply the best found size
        lyricsContainer.style.fontSize = `${bestSize}px`;
        
        // CRITICAL: After applying font size, ensure columns are properly set
        // This ensures the final configuration is correct
        adjustColumnsForFontSize(bestSize);
        
        // Verify the font size was actually applied
        const appliedSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        
        // Final verification: check if longest line fits
        const finalLongestLine = getLongestLineWidth(lyricsContainer, bestSize);
        const finalColumnCount = parseInt(window.getComputedStyle(lyricsContainer).columnCount) || 1;
        const finalColumnGap = parseFloat(window.getComputedStyle(lyricsContainer).columnGap) || 0;
        const finalColumnWidth = (containerWidth - (finalColumnCount - 1) * finalColumnGap) / finalColumnCount;
        const finalLineFits = finalLongestLine.width <= finalColumnWidth;
        
        // Update status indicator if available
        if (typeof updateAutoFitStatus === 'function') {
            updateAutoFitStatus(true);
        }

        lyricsContainer.classList.remove('autofit-calculating');

    }, 200); // Increased timeout to ensure DOM is fully ready
}

// Update auto-fit status indicator
function updateAutoFitStatus(isActive) {
    const statusElement = document.getElementById('autoFitStatus');
    if (statusElement) {
        if (isActive) {
            statusElement.textContent = 'AUTO';
            statusElement.style.opacity = '1';
        } else {
            statusElement.textContent = 'MANUAL';
            statusElement.style.opacity = '0.6';
        }
    }
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.autoFitLyrics = autoFitLyrics;
    window.updateAutoFitStatus = updateAutoFitStatus;
}

function displayLyrics(song, artist, lyrics) {
    try {
        const lyricsContainer = document.getElementById('lyricsDisplay');
        if (!lyricsContainer) {
            console.error('lyricsDisplay element not found');
            return;
        }
        
        const titleElement = document.getElementById('songTitle');
        if (titleElement) {
            titleElement.textContent = song || 'Select a Song';
        }

        const artistElement = document.getElementById('songArtist');
        if (artistElement) {
            artistElement.textContent = artist || '';
        }

        localStorage.setItem('lastViewedSong', song);

        lyricsContainer.innerHTML = '';

        const lyricsLines = (lyrics || '').split('\n');
        const containerWidth = lyricsContainer.offsetWidth;
        const isMobile = containerWidth < 480;
        
        lyricsLines.forEach(line => {
            const lineDiv = document.createElement('div');
            lineDiv.style.whiteSpace = 'pre';
            lineDiv.textContent = line || '\u00A0';
            
            // Ensure mobile lines use full width
            if (isMobile) {
                lineDiv.style.width = '100%';
                lineDiv.style.boxSizing = 'border-box';
                lineDiv.style.display = 'block';
                // Allow text wrapping for long lines
            }
            
            lyricsContainer.appendChild(lineDiv);
        });
        
        const currentStoredSong = lyricsContainer.getAttribute('data-song-title');
        if (!lyricsContainer.hasAttribute('data-original-lyrics') || currentStoredSong !== song) {
            lyricsContainer.setAttribute('data-original-lyrics', lyrics || '');
            lyricsContainer.setAttribute('data-song-title', song || '');
            lyricsContainer.setAttribute('data-clean', 'false');
        }

        if (chordDiagramsMode !== 'off') {
            const originalLyrics = lyricsContainer.getAttribute('data-original-lyrics') || lyrics || '';
            insertChordSummary(originalLyrics);
        }

        // Adjust columns and calculate unused space after lyrics are displayed
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
            const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
            const containerWidth = lyricsContainer.offsetWidth;
            
            // Only adjust columns on desktop (mobile uses vertical scrolling)
            if (containerWidth >= 480) {
                adjustColumnsForFontSize(currentSize);
            }
            calculateUnusedSpace();
        }, 100);

        const lyricsModal = document.getElementById('lyricsModal');
        if (lyricsModal) {
            lyricsModal.addEventListener('show.bs.modal', function (event) {
                const button = event.relatedTarget;
                if (button) {
                    // Opened via navbar add button — reset to add mode
                    const formTypeInput = document.getElementById('formType');
                    if (formTypeInput) formTypeInput.value = 'add';
                    const origInput = document.getElementById('originalSongTitle');
                    if (origInput) origInput.value = '';
                    document.getElementById('songInput').value = '';
                    document.getElementById('artistInput').value = '';
                    document.getElementById('lyricsText').value = '';
                    const setSelect = document.getElementById('setSelect');
                    if (setSelect) setSelect.value = window.currentSetNumber || 1;
                    const toggle = document.getElementById('moveCopyToggle');
                    if (toggle) toggle.style.display = 'none';
                    const moveRadio = document.querySelector('input[name="moveCopy"][value="move"]');
                    if (moveRadio) moveRadio.checked = true;
                    const label = document.getElementById('lyricsModalLabel');
                    if (label) label.textContent = 'Add Song';
                }
                // If no relatedTarget (programmatic open from openEditModal or search), leave as-is
            });

            // Show move/copy toggle when title matches an existing library song
            const songInputEl = document.getElementById('songInput');
            if (songInputEl) {
                songInputEl.addEventListener('input', function () {
                    const title = songInputEl.value.trim();
                    const toggle = document.getElementById('moveCopyToggle');
                    if (!toggle) return;
                    toggle.style.display = (title && localStorage.getItem(title)) ? 'flex' : 'none';
                });
            }
        }
        
        console.log('✅ displayLyrics completed successfully for:', song);
    } catch (error) {
        console.error('❌ Error in displayLyrics:', error);
    }
}

// Make displayLyrics available globally
if (typeof window !== 'undefined') {
    window.displayLyrics = displayLyrics;
}

function loadLastViewedSong() {
    const lastViewedSong = localStorage.getItem('lastViewedSong');
    if (lastViewedSong && lastViewedSong !== 'Select a Song') {
        if (localStorage.getItem(lastViewedSong)) {
            try {
                const songData = JSON.parse(localStorage.getItem(lastViewedSong));
                if (songData) {
                    // Use auto-fit directly to ensure optimal sizing on initial load
                    autoFitLyrics(lastViewedSong, songData.artist, songData.lyrics);
                } else {
                    displayLyrics('Select a Song', '', '');
                }
            } catch (e) {
                displayLyrics('Select a Song', '', '');
            }
        } else {
            displayLyrics('Select a Song', '', '');
        }
    } else {
        displayLyrics('Select a Song', '', '');
    }
}

document.addEventListener('DOMContentLoaded', function() {

    // Reflect default chord mode on button
    const chordBtn = document.getElementById('toggleChordDiagramsButton');
    if (chordBtn) {
        chordBtn.classList.add('active');
        chordBtn.setAttribute('title', CHORD_MODE_TITLES[chordDiagramsMode]);
    }

    // Always set up touch handlers, regardless of other elements
    setupMobileTouchHandlers();
    
    const lyricsContainer = document.getElementById('lyricsDisplay');

    loadDefaultSongs().then(() => {
        loadLastViewedSong();
        refreshSetDropdownItems();
        const lastViewedSong = localStorage.getItem('lastViewedSong');
        if (lastViewedSong !== 'Select a Song') {
            updateSongDropdown(window.currentSetNumber, true);
        }
    });

    const lyricsForm = document.getElementById('lyricsForm');
    if (lyricsForm) {
        lyricsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            try {
                const song = document.getElementById('songInput').value.trim();
                const artist = document.getElementById('artistInput').value.trim();
                const lyrics = document.getElementById('lyricsText').value.trim();

                if (!song || !lyrics) return;

                const targetSet = parseInt(document.getElementById('setSelect')?.value) || window.currentSetNumber || 1;
                const moveCopy = document.querySelector('input[name="moveCopy"]:checked')?.value || 'move';
                const originalTitle = document.getElementById('originalSongTitle')?.value || '';

                let titleToSave = song;
                if (moveCopy === 'copy') {
                    // Keep original, save under new title if set differs
                    const existing = localStorage.getItem(song);
                    if (existing) {
                        const existingData = JSON.parse(existing);
                        if (existingData.set !== targetSet) {
                            titleToSave = `${song} (Set ${targetSet})`;
                        }
                    }
                } else {
                    // Move: if title changed, remove old entry
                    if (originalTitle && originalTitle !== song) {
                        localStorage.removeItem(originalTitle);
                    }
                }

                localStorage.setItem(titleToSave, JSON.stringify({ artist, lyrics, set: targetSet }));

                // Auto-fit the saved song
                autoFitLyrics(titleToSave, artist, lyrics);

                // Update dropdown
                if (typeof updateSongDropdown === 'function') {
                    updateSongDropdown(targetSet);
                }

                // Reset form and close modal
                e.target.reset();
                const lyricsModal = document.getElementById('lyricsModal');
                if (lyricsModal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    const modalInstance = bootstrap.Modal.getInstance(lyricsModal);
                    if (modalInstance) {
                        modalInstance.hide();
                    } else {
                        lyricsModal.classList.remove('show');
                        lyricsModal.style.display = 'none';
                        document.body.classList.remove('modal-open');
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) backdrop.remove();
                    }
                }

            } catch (error) {
                console.error('❌ Error during form submission:', error);
                alert('Error saving song: ' + error.message);
            }
        });

        console.log('✅ Lyrics form submit handler attached successfully');
    } else {
        console.warn('❌ Lyrics form not found');
    }
    
    // Mobile touch handling variables (used by setupMobileTouchHandlers)
    const swipeThreshold = 50; // minimum distance for a swipe
    const tapThreshold = 15; // maximum movement for a tap
    const tapTimeThreshold = 300; // maximum time for a tap (ms)

    // Show swipe indicator briefly when lyrics area is touched
    function showSwipeIndicator() {
        // Create indicator if it doesn't exist
        if (!window.swipeIndicator) {
            const indicator = document.createElement('div');
            indicator.className = 'swipe-indicator';
            indicator.innerHTML = '<i class="bi bi-arrow-left-circle"></i> Previous | Next <i class="bi bi-arrow-right-circle"></i>';
            document.body.appendChild(indicator);
            window.swipeIndicator = indicator;
        }
        
        // Clear any existing timeout
        if (window.swipeIndicatorTimeout) {
            clearTimeout(window.swipeIndicatorTimeout);
        }
        
        window.swipeIndicator.classList.add('show');
        window.swipeIndicatorTimeout = setTimeout(() => {
            if (window.swipeIndicator) {
                window.swipeIndicator.classList.remove('show');
            }
        }, 1500);
    }

    // Enhanced mobile touch handler - supports both single and two-finger gestures
    function setupMobileTouchHandlers() {
        // Attach to the lyrics container wrapper for better touch coverage
        const lyricsContainer = document.querySelector('.lyrics-container');
        if (!lyricsContainer) {
            return;
        }

        // Touch tracking variables
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchMoved = false;
        
        // Two-finger gesture tracking
        let twoFingerStartX = 0;
        let twoFingerStartY = 0;
        let twoFingerStartTime = 0;
        let twoFingerMoved = false;

        function handleTouchStart(e) {
            if (!window.matchMedia('(pointer: coarse)').matches) return; // Non-touch device

            if (e.touches.length === 1) {
                // Single touch - record for single-finger gestures
                touchStartTime = Date.now();
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchMoved = false;
                
                // Show swipe indicator (briefly)
                showSwipeIndicator();
            } else if (e.touches.length === 2) {
                // Two fingers - record for two-finger gestures
                twoFingerStartTime = Date.now();
                twoFingerStartX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                twoFingerStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                twoFingerMoved = false;
                
                // Show two-finger indicator
                showTwoFingerIndicator();
            }
        }

        function handleTouchMove(e) {
            if (!window.matchMedia('(pointer: coarse)').matches) return;

            if (e.touches.length === 1) {
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const deltaX = Math.abs(touchX - touchStartX);
                const deltaY = Math.abs(touchY - touchStartY);

                // Prevent browser navigation (Firefox Android back/forward) on horizontal swipes
                if (deltaX > 10 && deltaX > deltaY * 1.5) {
                    e.preventDefault();
                }

                // Check if moved significantly
                if (deltaX > 15 || deltaY > 15) {
                    touchMoved = true;
                    // If auto-scroll is active and user starts manual scroll, stop it
                    if (autoScrollActive && deltaY > 5) {
                        stopAutoScroll();
                        const autoScrollButton = document.getElementById('autoScrollButton');
                        const autoScrollText = document.getElementById('autoScrollText');
                        if (autoScrollButton && autoScrollText) {
                            autoScrollText.className = 'bi bi-play-fill';
                            autoScrollButton.classList.remove('active');
                        }
                    }
                }
            } else if (e.touches.length === 2) {
                // Track two-finger movement
                const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                const deltaX = Math.abs(currentX - twoFingerStartX);
                const deltaY = Math.abs(currentY - twoFingerStartY);

                if (deltaX > 15 || deltaY > 15) {
                    twoFingerMoved = true;
                }
            }
        }

        function handleTouchEnd(e) {
            if (!window.matchMedia('(pointer: coarse)').matches) return;

            // Handle single finger gestures
            if (e.changedTouches.length === 1 && touchStartTime > 0) {
                const touchDuration = Date.now() - touchStartTime;
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                const absDeltaX = Math.abs(deltaX);
                const absDeltaY = Math.abs(deltaY);

                // Check if this was a quick tap (not a scroll gesture)
                const isQuickTap = touchDuration < 300 && 
                                  absDeltaX < 15 && 
                                  absDeltaY < 15 && 
                                  !touchMoved;

                // Check if this was a side swipe (horizontal gesture)
                const isSideSwipe = absDeltaX > 50 && 
                                   absDeltaX > absDeltaY * 1.5; // More horizontal than vertical

                if (isQuickTap) {
                    // TAP: Toggle auto-scroll
                    e.preventDefault();
                    const song = document.getElementById('songTitle').textContent;
                    if (!song || song === 'Select a Song') {
                        return; // No hint, just silent return
                    }

                    if (autoScrollActive) {
                        stopAutoScroll();
                        const autoScrollButton = document.getElementById('autoScrollButton');
                        const autoScrollText = document.getElementById('autoScrollText');
                        if (autoScrollButton && autoScrollText) {
                            autoScrollText.className = 'bi bi-play-fill';
                            autoScrollButton.classList.remove('active');
                        }
                    } else {
                        startAutoScroll();
                        const autoScrollButton = document.getElementById('autoScrollButton');
                        const autoScrollText = document.getElementById('autoScrollText');
                        if (autoScrollButton && autoScrollText) {
                            autoScrollText.className = 'bi bi-pause-fill';
                            autoScrollButton.classList.add('active');
                        }
                    }
                } else if (isSideSwipe) {
                    // SWIPE: Navigate between songs
                    e.preventDefault();
                    if (deltaX > 0) {
                        // Swipe right - previous song
                        loadPrevSong();
                    } else {
                        // Swipe left - next song
                        loadNextSong();
                    }
                    showSwipeIndicator();
                }
            }

            // Handle two-finger gestures
            if (e.changedTouches.length === 2 && twoFingerStartTime > 0) {
                // Calculate the midpoint of the two fingers at end
                const touch1 = e.changedTouches[0];
                const touch2 = e.changedTouches[1];
                const twoFingerEndX = (touch1.clientX + touch2.clientX) / 2;
                const twoFingerEndY = (touch1.clientY + touch2.clientY) / 2;
                
                const deltaX = twoFingerEndX - twoFingerStartX;
                const deltaY = twoFingerEndY - twoFingerStartY;
                const absDeltaX = Math.abs(deltaX);
                const absDeltaY = Math.abs(deltaY);
                const touchDuration = Date.now() - twoFingerStartTime;

                // Check if this was a two-finger horizontal swipe
                const isTwoFingerSwipe = absDeltaX > 30 && 
                                        absDeltaX > absDeltaY * 1.5 && 
                                        touchDuration < 1000;

                if (isTwoFingerSwipe) {
                    e.preventDefault();
                    if (deltaX > 0) {
                        // Two-finger swipe right - previous song
                        loadPrevSong();
                    } else {
                        // Two-finger swipe left - next song
                        loadNextSong();
                    }
                    showTwoFingerIndicator();
                }
            }

            // Reset tracking
            touchStartTime = 0;
            twoFingerStartTime = 0;
        }

        // Remove any existing listeners first to avoid duplicates
        lyricsContainer.removeEventListener('touchstart', handleTouchStart);
        lyricsContainer.removeEventListener('touchmove', handleTouchMove);
        lyricsContainer.removeEventListener('touchend', handleTouchEnd);

        // Add event listeners with proper options
        lyricsContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        lyricsContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        lyricsContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

        // Add subtle visual feedback for touch interactions (respecting theme)
        lyricsContainer.addEventListener('touchstart', function(e) {
            const containerWidth = window.innerWidth;
            if (containerWidth < 480) {
                // Use CSS variables to respect current theme
                this.style.backgroundColor = 'var(--bg-primary)';
                this.style.opacity = '0.95';
            }
        }, { passive: true });

        lyricsContainer.addEventListener('touchend', function(e) {
            const containerWidth = window.innerWidth;
            if (containerWidth < 480) {
                setTimeout(() => {
                    // Restore original background and opacity
                    this.style.backgroundColor = 'var(--bg-secondary)';
                    this.style.opacity = '1';
                }, 100);
            }
        }, { passive: true });
    }

    // Show two-finger swipe indicator
    function showTwoFingerIndicator() {
        // Create indicator if it doesn't exist
        if (!window.twoFingerIndicator) {
            const indicator = document.createElement('div');
            indicator.className = 'swipe-indicator';
            indicator.setAttribute('data-two-finger', 'true');
            indicator.innerHTML = '<i class="bi bi-hand-index"></i> 2-Finger: ← Previous | Next →';
            document.body.appendChild(indicator);
            window.twoFingerIndicator = indicator;
        }
        
        // Clear any existing timeout
        if (window.twoFingerIndicatorTimeout) {
            clearTimeout(window.twoFingerIndicatorTimeout);
        }
        
        window.twoFingerIndicator.classList.add('show');
        window.twoFingerIndicatorTimeout = setTimeout(() => {
            if (window.twoFingerIndicator) {
                window.twoFingerIndicator.classList.remove('show');
            }
        }, 1500);
    }

    // Mobile handlers are now set up in the main DOMContentLoaded listener

    // Show/hide auto-scroll button based on screen size
    function updateAutoScrollButtonVisibility() {
        const autoScrollButton = document.getElementById('autoScrollButton');
        if (!autoScrollButton) return;
        
        const containerWidth = window.innerWidth;
        if (containerWidth < 480) {
            autoScrollButton.style.display = 'flex'; // Show on mobile/tablet
        } else {
            autoScrollButton.style.display = 'none'; // Hide on desktop
        }
    }

    // Update visibility on load and resize
    updateAutoScrollButtonVisibility();
    window.addEventListener('resize', updateAutoScrollButtonVisibility);

    // Initialize with Set 1
    window.currentSetNumber = 1;
    updateSongDropdown(1);

    
    if (lyricsContainer) {
        let resizeDebounceTimer = null;
        let lastObservedWidth = null;

        const resizeObserver = new ResizeObserver(entries => {
            const newWidth = entries[0]?.contentRect.width ?? null;

            // Skip initial observation and ignore height-only changes
            // (font-size changes alter height but not width, so this prevents
            // auto-fit triggering itself in a loop after each calculation)
            if (lastObservedWidth === null || Math.abs(newWidth - lastObservedWidth) < 10) {
                lastObservedWidth = newWidth;
                return;
            }
            lastObservedWidth = newWidth;

            clearTimeout(resizeDebounceTimer);
            resizeDebounceTimer = setTimeout(() => {
                const songTitle = document.getElementById('songTitle');
                const currentSong = songTitle && songTitle.textContent;
                if (!currentSong || currentSong === 'Select a Song') return;

                try {
                    const songData = JSON.parse(localStorage.getItem(currentSong));
                    if (songData) {
                        const isClean = lyricsContainer.getAttribute('data-clean') === 'true';
                        const lyrics = isClean
                            ? cleanLyrics(songData.lyrics)
                            : songData.lyrics;
                        autoFitLyrics(currentSong, songData.artist, lyrics, true);
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }, 300);
        });

        resizeObserver.observe(lyricsContainer);
        
        // Stop auto-scroll when user manually scrolls
        let userScrollTimeout;
        lyricsContainer.addEventListener('scroll', function() {
            if (autoScrollActive) {
                // Clear any existing timeout
                if (userScrollTimeout) {
                    clearTimeout(userScrollTimeout);
                }
                
                // Wait a bit to see if this is a manual scroll or auto-scroll
                userScrollTimeout = setTimeout(() => {
                    // If auto-scroll is still active and we're not at the bottom, it was a manual scroll
                    if (autoScrollActive) {
                        const currentScroll = lyricsContainer.scrollTop;
                        const maxScroll = lyricsContainer.scrollHeight - lyricsContainer.clientHeight;
                        
                        // If not at the bottom, stop auto-scroll
                        if (currentScroll < maxScroll - 10) {
                            stopAutoScroll();
                            const autoScrollButton = document.getElementById('autoScrollButton');
                            const autoScrollText = document.getElementById('autoScrollText');
                            if (autoScrollButton && autoScrollText) {
                                autoScrollText.className = 'bi bi-play-fill';
                                autoScrollButton.classList.remove('active');
                            }
                        }
                    }
                }, 150); // Wait 150ms to distinguish manual from auto scroll
            }
        });
    }
    
    // Clean up old localStorage font size entries
    // Remove any saved font sizes since we now use auto-fit on every load
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('lyrics-font-size-')) {
            localStorage.removeItem(key);
        }
        if (key && key.startsWith('lyrics-auto-fit-')) {
            localStorage.removeItem(key);
        }
    }
    
    // Also remove the old global font size key
    localStorage.removeItem('lyrics-font-size');
});

// Arrow key event listener - moved outside DOMContentLoaded for immediate availability
document.addEventListener('keydown', function(event) {
    const lyricsModal = document.getElementById('lyricsModal');
    const editLyricsModal = document.getElementById('editLyricsModal');

    // Only process arrow keys if no modals are open
    if (lyricsModal && lyricsModal.classList.contains('show')) {
        return;
    }

    if (editLyricsModal && editLyricsModal.classList.contains('show')) {
        return;
    }

    // Handle arrow key navigation and font adjustment
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (typeof loadPrevSong === 'function') {
            loadPrevSong();
        }
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (typeof loadNextSong === 'function') {
            loadNextSong();
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (typeof adjustFontSize === 'function') {
            adjustFontSize(1); // Increase font size
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (typeof adjustFontSize === 'function') {
            adjustFontSize(-1); // Decrease font size
        }
    }
});

function deleteSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    
    if (!currentSong || currentSong === 'Select a Song') {
        return;
    }

    if (!confirm(`Are you sure you want to delete "${currentSong}"?`)) {
        return;
    }

    localStorage.removeItem(currentSong);
    updateSongDropdown(window.currentSetNumber);
    displayLyrics('Select a Song', '', '');

    const remainingSongs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size') {
            const songData = JSON.parse(localStorage.getItem(key));
            if (songData.set === window.currentSetNumber) {
                remainingSongs.push(key);
            }
        }
    }

    if (remainingSongs.length > 0) {
        const nextSong = remainingSongs[0];
        const songData = JSON.parse(localStorage.getItem(nextSong));
        autoFitLyrics(nextSong, songData.artist, songData.lyrics);
    }
}

// Export functions to window for HTML onclick handlers
window.loadNextSong = loadNextSong;
window.loadPrevSong = loadPrevSong;
window.adjustFontSize = adjustFontSize;
window.toggleCleanLyrics = toggleCleanLyrics;
window.toggleChordDiagrams = toggleChordDiagrams;
window.toggleAutoScroll = toggleAutoScroll;
window.deleteSong = deleteSong;
window.autoFitLyrics = autoFitLyrics;
window.displayLyrics = displayLyrics;
window.calculateUnusedSpace = calculateUnusedSpace;
