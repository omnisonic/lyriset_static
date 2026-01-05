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
        themeIcon.textContent = '☀️';
    } else {
        html.setAttribute('data-theme', 'light');
        themeIcon.textContent = '🌙';
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
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            html.setAttribute('data-theme', 'light');
            if (themeIcon) themeIcon.textContent = '🌙';
        }
        updateHamburgerIcon(savedTheme);
    } else {
        // No saved preference, use system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
            // Let CSS handle it automatically, but update icon
            if (themeIcon) themeIcon.textContent = '☀️';
            updateHamburgerIcon('dark');
        } else {
            if (themeIcon) themeIcon.textContent = '🌙';
            updateHamburgerIcon('light');
        }
    }
}

// Update hamburger icon based on theme
function updateHamburgerIcon(theme) {
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    if (!hamburgerIcon) return;
    
    if (theme === 'dark') {
        hamburgerIcon.src = 'img/hamburger-dark.svg';
    } else {
        hamburgerIcon.src = 'img/hamburger-light.svg';
    }
}

// Initialize theme when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
});
