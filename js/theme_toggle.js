// Theme toggle functionality
function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    
    // Get current theme from data attribute or check if dark mode is active
    const currentTheme = html.getAttribute('data-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine current effective theme
    let effectiveTheme;
    if (currentTheme) {
        effectiveTheme = currentTheme;
    } else {
        effectiveTheme = systemPrefersDark ? 'dark' : 'light';
    }
    
    // Toggle to the opposite theme
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    
    // Apply the new theme
    if (newTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        themeIcon.className = 'bi bi-sun-fill';
    } else {
        html.setAttribute('data-theme', 'light');
        themeIcon.className = 'bi bi-moon-stars';
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme-preference', newTheme);
    
    // Update hamburger icon if it exists
    updateHamburgerIcon(newTheme);
}

// Initialize theme on page load
function initializeTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme-preference');
    
    if (savedTheme) {
        // Apply saved preference
        if (savedTheme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            if (themeIcon) themeIcon.className = 'bi bi-sun-fill';
        } else {
            html.setAttribute('data-theme', 'light');
            if (themeIcon) themeIcon.className = 'bi bi-moon-stars';
        }
        updateHamburgerIcon(savedTheme);
    } else {
        // No saved preference, use system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
            // Let CSS handle it automatically, but update icon
            if (themeIcon) themeIcon.className = 'bi bi-sun-fill';
            updateHamburgerIcon('dark');
        } else {
            if (themeIcon) themeIcon.className = 'bi bi-moon-stars';
            updateHamburgerIcon('light');
        }
    }
}

// Update hamburger icon based on theme
function updateHamburgerIcon(theme) {
    // Hamburger icon is now handled by Bootstrap's built-in icon
    // No action needed
}

// Initialize theme when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
});
