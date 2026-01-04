function toggleCleanLyrics() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    const toggleButton = document.getElementById('toggleCleanLyricsButton');
    const toggleText = document.getElementById('toggleCleanLyricsText');
    
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }
    
    const originalLyrics = lyricsContainer.getAttribute('data-original-lyrics');
    const isClean = lyricsContainer.getAttribute('data-clean') === 'true';
    
    if (!originalLyrics) {
        console.error('No original lyrics found');
        return;
    }

    const song = document.getElementById('songTitle').textContent;
    const artist = document.getElementById('songArtist').textContent;
    if (isClean) {
        autoFitLyrics(song, artist, originalLyrics);
        toggleText.textContent = '✓';
        toggleButton.classList.add('active');
        lyricsContainer.setAttribute('data-clean', 'false');
    } else {
        const cleanedLyrics = cleanLyrics(originalLyrics);
        if (cleanedLyrics) {
            autoFitLyrics(song, artist, cleanedLyrics);
            toggleText.textContent = '✱';
            toggleButton.classList.remove('active');
            lyricsContainer.setAttribute('data-clean', 'true');
        }
    }
    
    // Ensure columns are adjusted after toggle
    setTimeout(() => {
        const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        adjustColumnsForFontSize(currentSize);
        calculateUnusedSpace();
    }, 150);
}
    
function loadNextSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    const songs = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size' && key !== 'lastViewedSong') {
            const songData = JSON.parse(localStorage.getItem(key));
            if (songData.set === window.currentSetNumber) {
                songs.push(key);
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
        autoFitLyrics(nextSong, songData.artist, songData.lyrics);
    } catch (e) {
        console.error("Error parsing JSON for song: " + nextSong, localStorage.getItem(nextSong), e);
    }
}

function loadPrevSong() {
    const currentSong = document.getElementById('songTitle').textContent;
    const songs = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lyrics-font-size' && key !== 'lastViewedSong') {
            const songData = JSON.parse(localStorage.getItem(key));
            if (songData.set === window.currentSetNumber) {
                songs.push(key);
            }
        }
    }
    
    if (songs.length === 0) return;
    
    songs.sort();
    
    const currentIndex = songs.indexOf(currentSong);
    const prevIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;
    const prevSong = songs[prevIndex];
    
    const songData = JSON.parse(localStorage.getItem(prevSong));
    autoFitLyrics(prevSong, songData.artist, songData.lyrics);
}
    
function adjustFontSize(delta) {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }

    const song = document.getElementById('songTitle').textContent;
    if (!song || song === 'Select a Song') {
        console.warn('No song selected, cannot adjust font size.');
        return;
    }
    
    const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
    const newSize = Math.min(Math.max(currentSize + delta, 8), 32);
    lyricsContainer.style.fontSize = `${newSize}px`;
    
    // Get longest line with current font size to check if adjustment is needed
    const longestLine = getLongestLineWidth(lyricsContainer, newSize);
    const containerWidth = lyricsContainer.offsetWidth;
    
    console.log(`Font changed to ${newSize}px. Longest line: ${longestLine.width}px, Container: ${containerWidth}px`);
    
    // Adjust column count based on new font size to prevent line wrapping
    adjustColumnsForFontSize(newSize);
    
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
    
    const containerWidth = lyricsContainer.offsetWidth;
    
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
    
    console.log(`Longest line: "${longestLine.text}" (${longestLine.width}px), Container: ${containerWidth}px, Lines: ${totalLines}, Columns: ${targetColumns}, Column Width: ${finalColumnWidth.toFixed(1)}px, Line Fits: ${longestLine.width <= finalColumnWidth}`);
    
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
        console.error('Required elements not found for space calculation');
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
    
    
    // Log detailed line-based information
    console.log('=== LINE ANALYSIS ===');
    console.log('Typography & Layout:', {
        fontSize: fontSize.toFixed(2) + 'px',
        lineHeight: actualLineHeight.toFixed(2) + 'px',
        columnCount: columnCount,
        columnWidth: columnWidth.toFixed(2) + 'px'
    });
    console.log('Longest Line Analysis:', {
        text: longestLine.text,
        width: longestLine.width.toFixed(2) + 'px',
        fitsInColumn: longestLine.width <= columnWidth
    });
    console.log('Line Distribution:', {
        totalLines: totalRenderedLines,
        hasWrappedLines: hasWrappedLines,
        linesPerColumn: linesPerColumn,
        availableLinesPerColumn: availableLinesPerColumn,
        fullColumns: fullColumns,
        linesInLastColumn: linesInLastColumn,
        emptyColumnsAfterText: emptyColumnsAfterText
    });
    
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
    console.log(`=== AUTO-FIT STARTED ===`);
    console.log(`Auto-fitting lyrics for: ${song}`);
    
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }

    // First display the lyrics with current settings
    displayLyrics(song, artist, lyrics);
    
    // Wait for DOM to update
    setTimeout(() => {
        console.log(`DOM updated, starting font size tests...`);
        
        // Get container height
        const containerHeight = lyricsContainer.clientHeight;
        const containerWidth = lyricsContainer.offsetWidth;
        
        console.log(`Container dimensions: ${containerWidth}w x ${containerHeight}h`);
        
        if (containerHeight === 0) {
            console.warn('Container height not available yet');
            return;
        }

        // Try different font sizes to find the maximum without overflow
        const minFontSize = 8;
        const maxFontSize = 32;
        const stepSize = 0.5;
        
        // Track all valid configurations and their scores
        let validSizes = [];
        
        console.log(`Testing font sizes from ${maxFontSize}px down to ${minFontSize}px...`);
        
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
            
            console.log(`  Font ${size}px: scrollHeight=${scrollHeight}, clientHeight=${clientHeight}, hasScrollbar=${hasScrollbar}, currentColumns=${currentColumnCount}, lineFits=${lineFitsInColumn}, horizontalOverflow=${hasHorizontalOverflow}`);
            
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
                console.log(`    ✅ VALID: ${size}px, ${currentColumnCount} cols, score=${score.toFixed(0)} [${reasons.join(', ')}]`);
            } else {
                console.log(`    ❌ INVALID: ${size}px - ${reasons.join(', ')}`);
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
            
            console.log(`\n=== AUTO-FIT SELECTION ===`);
            console.log(`Best size: ${bestSize}px (score: ${best.score.toFixed(0)})`);
            console.log(`Columns: ${best.columns}`);
            console.log(`Longest line: ${best.longestLine}px`);
            console.log(`Column width: ${best.columnWidth.toFixed(2)}px`);
            console.log(`Reasons: ${best.reasons.join(', ')}`);
        } else {
            console.log(`\n=== NO VALID SIZES FOUND ===`);
            console.log(`Using fallback: ${bestSize}px`);
            // Try to find the least bad option
            // This shouldn't happen often, but we have a fallback
        }
        
        // Apply the best found size
        lyricsContainer.style.fontSize = `${bestSize}px`;
        console.log(`Applied font size: ${bestSize}px to lyrics container`);
        
        // CRITICAL: After applying font size, ensure columns are properly set
        // This ensures the final configuration is correct
        adjustColumnsForFontSize(bestSize);
        
        // Log final results
        console.log('=== AUTO-FIT RESULTS ===');
        console.log(`✅ Optimal font size: ${bestSize}px`);
        console.log(`✅ No vertical overflow - fits perfectly in container`);
        
        // Verify the font size was actually applied
        const appliedSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
        console.log(`Verified applied font size: ${appliedSize}px`);
        
        // Final verification: check if longest line fits
        const finalLongestLine = getLongestLineWidth(lyricsContainer, bestSize);
        const finalColumnCount = parseInt(window.getComputedStyle(lyricsContainer).columnCount) || 1;
        const finalColumnGap = parseFloat(window.getComputedStyle(lyricsContainer).columnGap) || 0;
        const finalColumnWidth = (containerWidth - (finalColumnCount - 1) * finalColumnGap) / finalColumnCount;
        const finalLineFits = finalLongestLine.width <= finalColumnWidth;
        
        console.log(`Final verification: Longest line (${finalLongestLine.width}px) fits in column (${finalColumnWidth.toFixed(1)}px): ${finalLineFits}`);
        
        // Update status indicator if available
        if (typeof updateAutoFitStatus === 'function') {
            updateAutoFitStatus(true);
        }
        
    }, 200); // Increased timeout to ensure DOM is fully ready
}

// Debug function to check current overflow state
function debugOverflow() {
    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
        return;
    }
    
    const scrollHeight = lyricsContainer.scrollHeight;
    const clientHeight = lyricsContainer.clientHeight;
    const hasScrollbar = scrollHeight > clientHeight;
    const columnCount = parseInt(window.getComputedStyle(lyricsContainer).columnCount) || 1;
    const fontSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
    
    // Check line fitting
    const containerWidth = lyricsContainer.offsetWidth;
    const columnGap = parseFloat(window.getComputedStyle(lyricsContainer).columnGap) || 0;
    const columnWidth = (containerWidth - (columnCount - 1) * columnGap) / columnCount;
    const longestLine = getLongestLineWidth(lyricsContainer, fontSize);
    const lineFitsInColumn = longestLine.width <= columnWidth;
    
    // Calculate what adjustColumnsForFontSize would set
    const requiredColumnWidth = longestLine.width + 20;
    const maxColumns = Math.floor(containerWidth / requiredColumnWidth);
    let targetColumns = Math.max(1, maxColumns);
    if (fontSize > 24) {
        targetColumns = Math.min(targetColumns, 4);
    } else if (fontSize > 18) {
        targetColumns = Math.min(targetColumns, 5);
    } else {
        targetColumns = Math.min(targetColumns, 6);
    }
    if (containerWidth > 800 && targetColumns < 2) {
        targetColumns = 2;
    }
    targetColumns = Math.min(targetColumns, 6);
    
    console.log('=== CURRENT STATE ===');
    console.log(`Font size: ${fontSize}px`);
    console.log(`Scroll height: ${scrollHeight}px`);
    console.log(`Client height: ${clientHeight}px`);
    console.log(`Has scrollbar: ${hasScrollbar}`);
    console.log(`Current column count: ${columnCount}`);
    console.log(`Would set column count: ${targetColumns}`);
    console.log(`Container width: ${containerWidth}px`);
    console.log(`Column width: ${columnWidth.toFixed(2)}px`);
    console.log(`Longest line: "${longestLine.text}" (${longestLine.width}px)`);
    console.log(`Line fits in column: ${lineFitsInColumn}`);
    console.log(`Overflow Y: ${window.getComputedStyle(lyricsContainer).overflowY}`);
    
    // Additional debug: Check actual rendered columns
    const renderedColumns = lyricsContainer.querySelectorAll('div').length;
    const containerRect = lyricsContainer.getBoundingClientRect();
    console.log(`\n--- RENDERED STATE ---`);
    console.log(`Lyrics container rect: ${containerRect.left}-${containerRect.right} (${containerRect.width}px)`);
    console.log(`Number of line divs: ${renderedColumns}`);
    console.log(`Computed column-count: ${window.getComputedStyle(lyricsContainer).columnCount}`);
    console.log(`Computed column-gap: ${window.getComputedStyle(lyricsContainer).columnGap}`);
    
    // Check if there's horizontal overflow
    const horizontalOverflow = lyricsContainer.scrollWidth > lyricsContainer.clientWidth;
    console.log(`Horizontal overflow: ${horizontalOverflow} (scrollWidth=${lyricsContainer.scrollWidth}, clientWidth=${lyricsContainer.clientWidth})`);
    
    // Summary using new scoring logic (same as autofit)
    let score = 0;
    let isOptimal = false;
    let reasons = [];
    let isValid = true;
    
    // Priority 1: No scrollbar (critical)
    if (!hasScrollbar) {
        score += 1000;
        reasons.push('no-scrollbar');
    } else {
        isValid = false;
        reasons.push('has-scrollbar');
    }
    
    // Priority 1b: No horizontal overflow (critical)
    if (!horizontalOverflow) {
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
    if (targetColumns >= 1 && targetColumns <= 4) {
        score += 200 - (targetColumns * 10);
        reasons.push(`${targetColumns}-cols-reasonable`);
    } else if (targetColumns <= 6) {
        score += 50;
        reasons.push(`${targetColumns}-cols-acceptable`);
    } else {
        isValid = false;
        reasons.push(`${targetColumns}-cols-too-many`);
    }
    
    // Priority 4: Font size bonus (for display purposes)
    score += fontSize * 2;
    
    // Check if this would be considered optimal
    isOptimal = isValid;
    
    console.log(`\n✅ OPTIMAL: ${isOptimal ? 'YES' : 'NO'} (score: ${score})`);
    console.log(`Reasons: ${reasons.join(', ')}`);
    if (!isOptimal) {
        if (hasScrollbar || horizontalOverflow) console.log('  → Has scrollbar (check types above)');
        if (!lineFitsInColumn) console.log('  → Line too long for column');
        if (targetColumns > 4) console.log(`  → Would set ${targetColumns} columns (too many)`);
    }
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

// Add auto-fit button to the UI
function addAutoFitButton() {
    // Find the existing controls container
    const controlsContainer = document.querySelector('.btn-group');
    if (!controlsContainer) {
        console.error('Controls container not found');
        return;
    }

    // Check if button already exists
    if (document.getElementById('autoFitButton')) {
        console.log('Auto-fit button already exists');
        return;
    }

    // Create the auto-fit button
    const autoFitButton = document.createElement('button');
    autoFitButton.id = 'autoFitButton';
    autoFitButton.className = 'btn border border-light';
    autoFitButton.textContent = '⚡';
    autoFitButton.title = 'Auto-fit font size to screen';
    autoFitButton.onclick = function() {
        const song = document.getElementById('songTitle').textContent;
        if (!song || song === 'Select a Song') {
            console.warn('No song selected, cannot auto-fit.');
            return;
        }
        
        if (localStorage.getItem(song)) {
            try {
                const songData = JSON.parse(localStorage.getItem(song));
                autoFitLyrics(song, songData.artist, songData.lyrics);
            } catch (e) {
                console.error('Error auto-fitting:', e);
            }
        }
    };

    // Create status indicator
    const statusSpan = document.createElement('span');
    statusSpan.id = 'autoFitStatus';
    statusSpan.style.cssText = 'margin-left: 5px; font-size: 0.7em; opacity: 0.6; color: #bb86fc;';
    statusSpan.textContent = 'AUTO';

    // Insert the button after the A- button (before the clean lyrics button)
    const aMinusButton = controlsContainer.querySelector('button[onclick="adjustFontSize(-1)"]');
    if (aMinusButton) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.appendChild(autoFitButton);
        wrapper.appendChild(statusSpan);
        aMinusButton.parentNode.insertBefore(wrapper, aMinusButton.nextSibling);
    } else {
        // Fallback: add to the end
        controlsContainer.appendChild(autoFitButton);
    }

    console.log('Auto-fit button added to UI');
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.autoFitLyrics = autoFitLyrics;
    window.updateAutoFitStatus = updateAutoFitStatus;
    window.addAutoFitButton = addAutoFitButton;
}

function displayLyrics(song, artist, lyrics) {
    console.log(`Displaying lyrics for: ${song}`);

    const lyricsContainer = document.getElementById('lyricsDisplay');
    if (!lyricsContainer) {
        console.error('Lyrics container not found');
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
    console.log(`Setting last viewed song to: ${song}`);

    lyricsContainer.innerHTML = '';

    const lyricsLines = (lyrics || '').split('\n');
    lyricsLines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.textContent = line || '\u00A0';
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
        adjustColumnsForFontSize(currentSize);
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
                    console.log(`Loading last viewed song: ${lastViewedSong}`);
                    // Use auto-fit directly to ensure optimal sizing on initial load
                    autoFitLyrics(lastViewedSong, songData.artist, songData.lyrics);
                } else {
                    console.warn(`No song data found for ${lastViewedSong}`);
                    displayLyrics('Select a Song', '', '');
                }
            } catch (e) {
                console.error(`Error loading last viewed song ${lastViewedSong}:`, e);
                displayLyrics('Select a Song', '', '');
            }
        } else {
            console.log(`No song found with title: ${lastViewedSong}`);
            displayLyrics('Select a Song', '', '');
        }
    } else {
        console.log('No last viewed song found, loading default songs');
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
        console.error('Element with ID "lyrics_url" not found.');
        return;
    }

    if (!lyricsContainer) {
        console.error('Lyrics container not found.');
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
    

        // Add touch swipe handling
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50; // minimum distance for a swipe
    
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
    
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    
        function handleSwipe() {
            // Don't process swipes if color slider is active
            if (window.isColorSliderActive) {
                return;
            }
            
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    // Swipe right - go to previous song
                    loadPrevSong();
                } else {
                    // Swipe left - go to next song
                    loadNextSong();
                }
            }
        }

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
                console.log('Container resized:', {
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
                
                // Adjust columns when container resizes
                const currentSize = parseFloat(window.getComputedStyle(lyricsContainer).fontSize);
                adjustColumnsForFontSize(currentSize);
                
                // Recalculate space after resize
                setTimeout(() => {
                    calculateUnusedSpace();
                }, 100);
            }
        });
        
        resizeObserver.observe(lyricsContainer);
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
