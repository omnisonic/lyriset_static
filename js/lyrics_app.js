// Auto-scroll functionality for mobile
let autoScrollInterval = null;
let autoScrollActive = false;

function toggleAutoScroll() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    const autoScrollButton = document.getElementById('autoScrollButton');
    const autoScrollText = document.getElementById('autoScrollText');
    
    if (!lyricsContainer) {
        return;
    }
    
    // Check if we're on mobile/tablet
    const containerWidth = lyricsContainer.offsetWidth;
    if (containerWidth >= 769) {
        return;
    }
    
    const song = document.getElementById('songTitle').textContent;
    if (!song || song === 'Select a Song') {
        return;
    }
    
    if (autoScrollActive) {
        // Stop auto-scroll
        stopAutoScroll();
        autoScrollText.textContent = '▶';
        autoScrollButton.classList.remove('active');
    } else {
        // Start auto-scroll
        startAutoScroll();
        autoScrollText.textContent = '⏸';
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
        autoScrollText.textContent = '▶';
        autoScrollButton.classList.remove('active');
    }
    
    if (isClean) {
        // Switching back to original lyrics
        if (typeof autoFitLyrics === 'function') {
            autoFitLyrics(song, artist, originalLyrics);
        } else {
            displayLyrics(song, artist, originalLyrics);
        }
        toggleText.textContent = '✨';
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
            toggleText.textContent = '🧹';
            toggleButton.classList.remove('active');
            lyricsContainer.setAttribute('data-clean', 'true');
        }
    }
    
    // Ensure layout is adjusted after toggle
    setTimeout(() => {
        const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        const containerWidth = lyricsContainer.offsetWidth;
        
        // Only adjust columns on desktop (mobile uses vertical scrolling)
        if (containerWidth >= 769) {
            adjustColumnsForFontSize(currentSize);
        }
        calculateUnusedSpace();
    }, 150);
}
    
function loadNextSong() {
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
            autoFitLyrics(nextSong, songData.artist, songData.lyrics);
        }
    } catch (e) {
        console.error('Error loading next song:', e);
    }
}

function loadPrevSong() {
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
            autoFitLyrics(prevSong, songData.artist, songData.lyrics);
        }
    } catch (e) {
        console.error('Error loading previous song:', e);
    }
}
    
function adjustFontSize(delta) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        return;
    }

    const song = document.getElementById('songTitle').textContent;
    if (!song || song === 'Select a Song') {
        return;
    }
    
    const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
    const containerWidth = lyricsContainer.offsetWidth;
    
    // Mobile: Use smaller font size range
    if (containerWidth < 769) {
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
        calculateUnusedSpace();
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
    if (containerWidth < 769) {
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
    const isMobile = containerWidth < 769;
    
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
function autoFitLyrics(song, artist, lyrics) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        return;
    }

    // First display the lyrics with current settings
    displayLyrics(song, artist, lyrics);
    
    // Wait for DOM to update
    setTimeout(() => {
        // Get container dimensions
        const containerHeight = lyricsContainer.clientHeight;
        const containerWidth = lyricsContainer.offsetWidth;
        
        if (containerHeight === 0) {
            return;
        }

        // Check if we're on mobile/tablet (vertical scrolling layout)
        const isMobile = containerWidth < 769;
        
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
            
            return; // Skip desktop column calculations
        }
        
        // Desktop: Use column-based layout with complex calculations
        
        // Try different font sizes to find the maximum without overflow
        const minFontSize = 8;
        const maxFontSize = 32;
        const stepSize = 0.5;
        
        // Track all valid configurations and their scores
        let validSizes = [];
        
        // Test font sizes from large to small
        for (let size = maxFontSize; size >= minFontSize; size -= stepSize) {
            // Apply temporary font size
            lyricsContainer.style.fontSize = `${size}px`;
            
            // CRITICAL: Also adjust columns for this font size to get accurate measurements
            adjustColumnsForFontSize(size);
            
            // Force reflow to ensure measurements are accurate
            const forceReflow = lyricsContainer.offsetHeight;
            
            // Check for vertical overflow
            const scrollHeight = lyricsContainer.scrollHeight;
            const clientHeight = lyricsContainer.clientHeight;
            
            // Check if scrollbar is visible (this is the key indicator!)
            const hasScrollbar = scrollHeight > clientHeight;
            
            // Check for horizontal overflow with current column settings
            const hasHorizontalOverflow = lyricsContainer.scrollWidth > lyricsContainer.clientWidth;
            
            // Get current column settings
            const currentColumnCount = parseInt(window.getComputedStyle(lyricsContainer).columnCount) || 1;
            const columnGap = parseFloat(window.getComputedStyle(lyricsContainer).columnGap) || 0;
            const columnWidth = (containerWidth - (currentColumnCount - 1) * columnGap) / currentColumnCount;
            
            // Check if longest line fits in current column width
            const longestLine = getLongestLineWidth(lyricsContainer, size);
            const lineFitsInColumn = longestLine.width <= columnWidth;
            
            // Get total lines for column limit check
            const lineDivs = Array.from(lyricsContainer.querySelectorAll('div'));
            const totalLines = lineDivs.length;
            
            // Score this configuration
            let score = 0;
            let isValid = true;
            let reasons = [];
            
            // Priority 1: No scrollbar (critical)
            if (!hasScrollbar) {
                score += 1000;
                reasons.push('no-scrollbar');
            } else {
                isValid = false;
                reasons.push('has-scrollbar');
            }
            
            // Priority 1b: No horizontal overflow (critical)
            if (!hasHorizontalOverflow) {
                score += 1000;
                reasons.push('no-horizontal-overflow');
            } else {
                isValid = false;
                reasons.push('horizontal-overflow');
            }
            
            // Priority 2: Line fits in column (critical)
            if (lineFitsInColumn) {
                score += 500;
                reasons.push('line-fits');
            } else {
                isValid = false;
                reasons.push('line-too-long');
            }
            
            // Priority 3: Reasonable column count (1-4 is good)
            if (currentColumnCount >= 1 && currentColumnCount <= 4) {
                score += 200 - (currentColumnCount * 10); // Fewer columns score slightly higher
                reasons.push(`${currentColumnCount}-cols-reasonable`);
            } else if (currentColumnCount <= 6) {
                score += 50; // 5-6 columns is acceptable but not ideal
                reasons.push(`${currentColumnCount}-cols-acceptable`);
            } else {
                isValid = false;
                reasons.push(`${currentColumnCount}-cols-too-many`);
            }
            
            // Priority 4: Larger font size bonus
            score += size * 2; // Larger fonts get more points
            
            // Priority 5: Penalize excessive column gaps (wasted space)
            if (currentColumnCount > 1) {
                const totalGap = (currentColumnCount - 1) * columnGap;
                const wastedSpace = totalGap / containerWidth;
                score -= wastedSpace * 100;
            }
            
            if (isValid) {
                validSizes.push({
                    size: size,
                    score: score,
                    columns: currentColumnCount,
                    longestLine: longestLine.width,
                    columnWidth: columnWidth,
                    reasons: reasons
                });
            }
        }
        
        // Find the best valid size
        let bestSize = 14; // fallback default
        
        if (validSizes.length > 0) {
            // Sort by score (highest first)
            validSizes.sort((a, b) => b.score - a.score);
            
            // Pick the best
            const best = validSizes[0];
            bestSize = best.size;
        } else {
            // Try to find the least bad option
            // This shouldn't happen often, but we have a fallback
        }
        
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
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
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
    const isMobile = containerWidth < 769;
    
    lyricsLines.forEach(line => {
        const lineDiv = document.createElement('div');
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

    // Adjust columns and calculate unused space after lyrics are displayed
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
        const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        const containerWidth = lyricsContainer.offsetWidth;
        
        // Only adjust columns on desktop (mobile uses vertical scrolling)
        if (containerWidth >= 769) {
            adjustColumnsForFontSize(currentSize);
        }
        calculateUnusedSpace();
    }, 100);

    const lyricsModal = document.getElementById('lyricsModal');
    if (lyricsModal) {
        lyricsModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const formType = button.textContent.trim() === 'Add Song' ? 'add' : 'edit';
            const formTypeInput = document.getElementById('formType');
            if (formTypeInput) {
                formTypeInput.value = formType;
            }
        });
    }
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
    const urlInput = document.getElementById('lyrics_url');
    const lyricsContainer = document.getElementById('lyricsDisplay');

    loadDefaultSongs().then(() => {
        loadLastViewedSong();
        const lastViewedSong = localStorage.getItem('lastViewedSong');
        if (lastViewedSong !== 'Select a Song') {
            updateSongDropdown(window.currentSetNumber);
        }
    });

    if (!urlInput) {
        return;
    }

    if (!lyricsContainer) {
        return;
    }

    // Don't load saved font sizes - we use auto-fit on every load
    // Clear any existing font size to ensure clean state
    lyricsContainer.style.fontSize = '';

    const lyricsDisplay = lyricsContainer.textContent;
    lyricsContainer.setAttribute('data-original-lyrics', lyricsDisplay);
    const cleanedLyrics = cleanLyrics(lyricsDisplay);
    lyricsContainer.textContent = cleanedLyrics;

    const lyricsForm = document.getElementById('lyricsForm');
    if (lyricsForm) {
        lyricsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const song = document.getElementById('songInput').value.trim();
            const artist = document.getElementById('artistInput').value.trim();
            const lyrics = document.getElementById('lyricsText').value.trim();

            if (!song || !lyrics) return;

            localStorage.setItem(song, JSON.stringify({
                artist: artist,
                lyrics: lyrics,
                set: window.currentSetNumber
            }));

            displayLyrics(song, artist, lyrics);

            const formTypeInput = document.getElementById('formType');
            if (formTypeInput && formTypeInput.value === 'add') {
                updateSongDropdown(window.currentSetNumber);
            }

            e.target.reset();
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('lyricsModal'));
            if (modalInstance) {
                modalInstance.hide();
            }
        });
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
            indicator.textContent = '← Previous | Next →';
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

    // Simplified mobile touch handler - single unified handler
    function setupMobileTouchHandlers() {
        const lyricsContainer = document.getElementById('lyricsDisplay');
        if (!lyricsContainer) return;

        // Single touch handler for iOS compatibility
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchMoved = false;

        lyricsContainer.addEventListener('touchstart', function(e) {
            // Only handle single touch on mobile
            if (e.touches.length !== 1) return;
            
            const containerWidth = lyricsContainer.offsetWidth;
            if (containerWidth >= 769) return; // Desktop only

            // Record touch start
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchMoved = false;

            // Show swipe indicator (briefly)
            showSwipeIndicator();

        }, { passive: true });

        lyricsContainer.addEventListener('touchmove', function(e) {
            const containerWidth = lyricsContainer.offsetWidth;
            if (containerWidth >= 769) return;

            if (e.touches.length === 1) {
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const deltaX = Math.abs(touchX - touchStartX);
                const deltaY = Math.abs(touchY - touchStartY);

                // Check if moved significantly
                if (deltaX > 15 || deltaY > 15) {
                    touchMoved = true;

                    // If auto-scroll is active and user starts manual scroll, stop it
                    if (autoScrollActive && deltaY > 5) {
                        stopAutoScroll();
                        const autoScrollButton = document.getElementById('autoScrollButton');
                        const autoScrollText = document.getElementById('autoScrollText');
                        if (autoScrollButton && autoScrollText) {
                            autoScrollText.textContent = '▶';
                            autoScrollButton.classList.remove('active');
                        }
                    }
                }
            }
        }, { passive: true });

        lyricsContainer.addEventListener('touchend', function(e) {
            const containerWidth = lyricsContainer.offsetWidth;
            if (containerWidth >= 769) return;

            // Calculate touch metrics
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
                        autoScrollText.textContent = '▶';
                        autoScrollButton.classList.remove('active');
                    }
                } else {
                    startAutoScroll();
                    const autoScrollButton = document.getElementById('autoScrollButton');
                    const autoScrollText = document.getElementById('autoScrollText');
                    if (autoScrollButton && autoScrollText) {
                        autoScrollText.textContent = '⏸';
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
            // If it was a vertical scroll gesture, let it pass through naturally

        }, { passive: false }); // Non-passive to allow preventDefault on taps/swipes

        // Add subtle visual feedback for touch interactions (respecting theme)
        lyricsContainer.addEventListener('touchstart', function(e) {
            const containerWidth = lyricsContainer.offsetWidth;
            if (containerWidth < 769) {
                // Use CSS variables to respect current theme
                this.style.backgroundColor = 'var(--bg-primary)';
                this.style.opacity = '0.95';
            }
        }, { passive: true });

        lyricsContainer.addEventListener('touchend', function(e) {
            const containerWidth = lyricsContainer.offsetWidth;
            if (containerWidth < 769) {
                setTimeout(() => {
                    // Restore original background and opacity
                    this.style.backgroundColor = 'var(--bg-secondary)';
                    this.style.opacity = '1';
                }, 100);
            }
        }, { passive: true });
    }

    // Initialize mobile handlers when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMobileTouchHandlers);
    } else {
        setupMobileTouchHandlers();
    }

    // Show/hide auto-scroll button based on screen size
    function updateAutoScrollButtonVisibility() {
        const autoScrollButton = document.getElementById('autoScrollButton');
        if (!autoScrollButton) return;
        
        const containerWidth = window.innerWidth;
        if (containerWidth < 769) {
            autoScrollButton.style.display = 'flex'; // Show on mobile/tablet
        } else {
            autoScrollButton.style.display = 'none'; // Hide on desktop
        }
    }

    // Update visibility on load and resize
    updateAutoScrollButtonVisibility();
    window.addEventListener('resize', updateAutoScrollButtonVisibility);

    // Add event listener for left and right arrow keys
    document.addEventListener('keydown', function(event) {
        const lyricsModal = document.getElementById('lyricsModal');
        const editLyricsModal = document.getElementById('editLyricsModal');

        if (lyricsModal && lyricsModal.classList.contains('show')) {
            return;
        }

        if (editLyricsModal && editLyricsModal.classList.contains('show')) {
            return;
        }

        if (event.key === 'ArrowLeft') {
            loadPrevSong();
        } else if (event.key === 'ArrowRight') {
            loadNextSong();
        } else if (event.key === 'ArrowUp') {
            adjustFontSize(1); // Increase font size
        } else if (event.key === 'ArrowDown') {
            adjustFontSize(-1); // Decrease font size
        }
    });

    // Initialize with Set 1
    window.currentSetNumber = 1;
    updateSongDropdown(1);

    
    if (lyricsContainer) {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const containerWidth = entry.contentRect.width;
                const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
                
                // Only adjust columns on desktop (mobile uses vertical scrolling)
                if (containerWidth >= 769) {
                    adjustColumnsForFontSize(currentSize);
                }
                
                // Recalculate space after resize
                setTimeout(() => {
                    calculateUnusedSpace();
                }, 100);
            }
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
                                autoScrollText.textContent = '▶';
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
