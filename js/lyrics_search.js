// Add styles for Google Custom Search
const styles = `
/* Search box styles */
.gsc-control-cse {
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
}

.gsc-search-box {
    margin: 0 !important;
}

.gsc-input-box {
    border-radius: 4px 0 0 4px !important;
    border: 1px solid #ced4da !important;
    border-right: none !important;
    height: 38px !important;
}

.gsc-search-button-v2 {
    border-radius: 0 4px 4px 0 !important;
    padding: 9px 16px !important;
    background-color: #198754 !important;
    border-color: #fff !important;
}

.gsc-search-button-v2:hover {
    background-color: #157347 !important;
}

/* Results styles */
.gsc-results-wrapper-overlay {
    top: 10% !important;
    left: 10% !important;
    width: 80% !important;
    height: 80% !important;
}

.gsc-modal-background-image {
    background-color: rgba(0, 0, 0, 0.4) !important;
}

.gsc-results .gsc-cursor-box {
    margin: 10px 0 !important;
}

.gsc-result {
    padding: 10px !important;
    border-bottom: 1px solid #eee !important;
}

.gs-title {
    color: #1a0dab !important;
    text-decoration: none !important;
}

.gs-title:hover {
    text-decoration: underline !important;
}

.gs-snippet {
    color: #545454 !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Function to handle form submission
function submitLyricsUrl(url) {
    // Create and submit a form
    const form = document.createElement('form');
    form.method = 'POST';
    // Use the base URL without query parameters
    form.action = window.location.pathname;

    // Add CSRF token
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = document.querySelector('[name=csrfmiddlewaretoken]').value;
    form.appendChild(csrfInput);

    // Add lyrics URL
    const urlInput = document.createElement('input');
    urlInput.type = 'hidden';
    urlInput.name = 'lyrics_url';
    urlInput.value = url;
    form.appendChild(urlInput);

    // Close the Google CSE overlay
    const closeButton = document.querySelector('.gsc-results-close-btn');
    if (closeButton) {
        closeButton.click();
    }

    // Submit the form
    document.body.appendChild(form);
    form.submit();
}

// Function to log search result details
function logSearchResults(container) {
    console.log('Found search results container:', container);

    // Log all links in the container
    const links = container.querySelectorAll('a');
    console.log('Number of links found:', links.length);

    links.forEach((link, index) => {
        console.log(`Link ${index}:`, {
            element: link,
            href: link.href,
            text: link.textContent,
            classes: link.className,
            parentElement: link.parentElement,
            parentClasses: link.parentElement.className
        });
    });
}

// Function to handle result clicks
// function handleResultClick(event) {
//     // Find the closest link element
//     const link = event.target.closest('a.gs-title');
//     if (!link) return;

//     // Log clicked link details
//     console.log('Clicked link details:', {
//         element: link,
//         href: link.href,
//         text: link.textContent,
//         classes: link.className
//     });

//     // Always prevent navigation
//     event.preventDefault();
//     event.stopPropagation();
//     event.stopImmediatePropagation();

//     // Get the URL and extract the actual destination URL from Google's redirect
//     const googleUrl = new URL(link.href);
//     const params = new URLSearchParams(googleUrl.search);
//     const actualUrl = params.get('q');

//     if (actualUrl) {
//         console.log('Extracted actual URL:', actualUrl);
//         submitLyricsUrl(actualUrl);
//     } else {
//         console.error('Could not extract destination URL from:', link.href);
//     }
// }

// Set up observer to watch for search results
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        // Look for the search results container
        const resultsWrapper = document.querySelector('.gsc-results-wrapper-overlay');
        if (!resultsWrapper) return;

        // Look for actual results within the container
        const resultsDiv = resultsWrapper.querySelector('.gsc-results .gsc-webResult');
        if (!resultsDiv) return;

        // Log the results once they're populated
        console.log('Search results loaded:', resultsDiv);
        logSearchResults(resultsDiv);

        // Remove any existing click handlers
        resultsDiv.removeEventListener('click', handleResultClick, true);

        // Add click handler for this set of results
        resultsDiv.addEventListener('click', handleResultClick, true);
    });
});

// Start observing once the document is loaded
window.onload = function() {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });
};
