function cleanLyrics(text) {
    if (!text) {
        return "";
    }

    // Remove HTML tags but preserve line breaks
    text = text.replace(/<br\s*\/?>/g, '\n');
    text = text.replace(/<[^>]+>/g, '');

    // Process the text line by line
    const lines = text.split('\n');
    const cleanedLines = [];

    // Detect if there's a chord summary at the start
    let inChordSummary = false;
    if (lines.length > 0) {
        const firstFewLines = lines.slice(0, Math.min(5, lines.length));
        const chordLines = firstFewLines.filter(line =>
            /^\s*[A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?(?:\d+)?(?:\/[A-G][#b]?)?\s*$/.test(line)
        );
        inChordSummary = chordLines.length >= 2; // Consider it a chord summary if multiple chord lines at start
    }

    for (let line of lines) {
        line = line.trim(); // Remove trailing whitespace

        // Look for a blank line after the chord summary
        if (inChordSummary && !line) {
            inChordSummary = false;
            cleanedLines.push(''); // Preserve the blank line
            continue;
        }

        if (inChordSummary) {
            continue; // Skip lines while in chord summary
        }

        // Track verse structure
        if (!line) {
            // Preserve blank lines
            cleanedLines.push('');
            continue;
        }

        // Remove chords from the line
        line = line.replace(/\[[A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?(?:\d+)?(?:\/[A-G][#b]?)?\]/g, '').trim();

        // Remove lines that have no meaningful words, only one or two alphanumeric characters,
        // or contain only symbols/numbers (including lines like "==============2=0==========").
        if (/^(?!\s*$)(?!.*[a-zA-Z]{3,}).*$/.test(line) || /^[^a-zA-Z0-9]*$/.test(line)) {
            continue;
        }

        // Remove lines that are made up only of consecutive symbols
        if (/^[^\w\s]*[\W_]{2,}[^\w\s]*$/.test(line)) {
            continue;
        }

        // Remove lines with colons (likely metadata)
        if (line.includes(':')) {
            continue;
        }

        // Remove lines with parentheses (likely metadata)
        if (line.includes('(') || line.includes(')')) {
            continue;
        }

        // Remove lines with hash # (likely metadata)
        if (line.includes('#')) {
            continue;
        }

        // For lyrics, strip leading whitespace but preserve the rest
        const currentLine = line.replace(/^\s+/, '');
        if (currentLine) {
            // Remove one preceding blank line if it exists
            if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] === '') {
                cleanedLines.pop(); // Remove the last empty line
            }

            // Add current line to cleaned lines
            cleanedLines.push(currentLine);
        } else {
        }
    }

    // Join lines and trim any extra whitespace
    const result = cleanedLines.join('\n').trim();

    return result;
}
