/**
 * Theme Configuration File
 * 
 * This file contains all theme settings including color schemes, light/dark modes,
 * and visual properties. It can be easily transferred between projects.
 * 
 * USAGE:
 * 1. Include this file in your project
 * 2. Use the theme manager functions to apply themes
 * 3. Customize the color schemes as needed
 */

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

const ThemeConfig = {
    // Default theme settings
    default: {
        name: 'default',
        type: 'light',
        colors: {
            // Background colors
            bgPrimary: '#e9e6dc',
            bgSecondary: '#eae8dc',
            
            // Text colors
            textPrimary: '#333',
            textSecondary: '#7f8c8d',
            
            // Border and accent colors
            borderColor: '#8b6f47',
            shadow: 'rgba(0,0,0,0.1)',
            
            // Button and interactive elements
            buttonBg: '#d4c5b0',
            buttonHover: '#c0b098',
            
            // Modal and input elements
            modalBg: '#e9e6dc',
            inputBg: '#ffffff',
            inputBorder: '#8b6f47',
            
            // Dropdown elements
            dropdownHover: '#c0b098',
            dropdownBorder: '#8b6f47',
            
            // Special colors
            linkColor: '#8b6f47',
            linkHover: '#c0b098',
            success: '#28a745',
            error: '#dc3545'
        },
        typography: {
            fontFamily: 'Arial, sans-serif',
            baseFontSize: '16px',
            lineHeight: 1.5
        }
    },

    dark: {
        name: 'dark',
        type: 'dark',
        colors: {
            // Background colors
            bgPrimary: '#1a1a1a',
            bgSecondary: '#2d2d2d',
            
            // Text colors
            textPrimary: '#c0c0c0',
            textSecondary: '#707070',
            
            // Border and accent colors
            borderColor: '#3a3a3a',
            shadow: 'rgba(0,0,0,0.3)',
            
            // Button and interactive elements
            buttonBg: '#2d2d2d',
            buttonHover: '#3a3a3a',
            
            // Modal and input elements
            modalBg: '#2d2d2d',
            inputBg: '#1a1a1a',
            inputBorder: '#3a3a3a',
            
            // Dropdown elements
            dropdownHover: '#3a3a3a',
            dropdownBorder: '#3a3a3a',
            
            // Special colors
            linkColor: '#6ba3d4',
            linkHover: '#8dc1e6',
            success: '#28a745',
            error: '#dc3545'
        },
        typography: {
            fontFamily: 'Arial, sans-serif',
            baseFontSize: '16px',
            lineHeight: 1.5
        }
    },

    // Alternative color schemes that can be used
    schemes: {
        warm: {
            name: 'warm',
            type: 'light',
            colors: {
                bgPrimary: '#f5e6d3',
                bgSecondary: '#f7ebdc',
                textPrimary: '#4a2c2a',
                textSecondary: '#8b5e5a',
                borderColor: '#d4a574',
                buttonBg: '#e8c4a0',
                buttonHover: '#d4b08c',
                linkColor: '#d4a574',
                linkHover: '#c09060'
            }
        },

        cool: {
            name: 'cool',
            type: 'light',
            colors: {
                bgPrimary: '#e6e9f0',
                bgSecondary: '#eef2f7',
                textPrimary: '#2c3e50',
                textSecondary: '#7f8c8d',
                borderColor: '#3498db',
                buttonBg: '#d5dbdb',
                buttonHover: '#c0c7c7',
                linkColor: '#3498db',
                linkHover: '#2980b9'
            }
        },

        midnight: {
            name: 'midnight',
            type: 'dark',
            colors: {
                bgPrimary: '#0f0f1e',
                bgSecondary: '#1a1a2e',
                textPrimary: '#e0e0e0',
                textSecondary: '#a0a0a0',
                borderColor: '#16213e',
                buttonBg: '#1a1a2e',
                buttonHover: '#16213e',
                linkColor: '#4a90e2',
                linkHover: '#6ba3e8'
            }
        },

        forest: {
            name: 'forest',
            type: 'light',
            colors: {
                bgPrimary: '#e8f4e8',
                bgSecondary: '#f0f9f0',
                textPrimary: '#2d4a2d',
                textSecondary: '#5a7a5a',
                borderColor: '#4a7c4a',
                buttonBg: '#d4e8d4',
                buttonHover: '#c0d8c0',
                linkColor: '#4a7c4a',
                linkHover: '#3a6c3a'
            }
        }
    },

    // System preferences configuration
    system: {
        prefersDarkScheme: window.matchMedia('(prefers-color-scheme: dark)'),
        storageKey: 'theme-preference',
        themeAttribute: 'data-theme'
    }
};

// ============================================================================
// THEME MANAGER
// ============================================================================

class ThemeManager {
    constructor(config = ThemeConfig) {
        this.config = config;
        this.currentTheme = null;
        this.listeners = new Set();
    }

    /**
     * Initialize theme on page load
     */
    initialize() {
        const savedTheme = this.getSavedTheme();
        const systemPrefersDark = this.config.system.prefersDarkScheme.matches;

        if (savedTheme) {
            this.applyTheme(savedTheme);
        } else if (systemPrefersDark) {
            this.applyTheme('dark');
        } else {
            this.applyTheme('default');
        }

        // Listen for system theme changes
        this.config.system.prefersDarkScheme.addEventListener('change', (e) => {
            if (!this.getSavedTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'default');
            }
        });
    }

    /**
     * Apply a theme by name
     */
    applyTheme(themeName) {
        const theme = this.getTheme(themeName);
        if (!theme) {
            console.warn(`Theme "${themeName}" not found`);
            return;
        }

        const html = document.documentElement;
        
        // Apply theme attribute
        if (themeName === 'default') {
            html.removeAttribute(this.config.system.themeAttribute);
        } else {
            html.setAttribute(this.config.system.themeAttribute, themeName);
        }

        // Apply CSS variables
        this.applyCSSVariables(theme.colors);

        // Update current theme
        this.currentTheme = themeName;

        // Notify listeners
        this.notifyListeners(themeName, theme);

        return theme;
    }

    /**
     * Get theme configuration by name
     */
    getTheme(themeName) {
        if (themeName === 'default' || themeName === 'light') {
            return this.config.default;
        }
        
        if (this.config[themeName]) {
            return this.config[themeName];
        }

        if (this.config.schemes[themeName]) {
            return this.config.schemes[themeName];
        }

        return null;
    }

    /**
     * Get all available theme names
     */
    getAvailableThemes() {
        const themes = ['default'];
        
        // Add main themes
        Object.keys(this.config).forEach(key => {
            if (key !== 'default' && key !== 'schemes' && key !== 'system') {
                themes.push(key);
            }
        });

        // Add scheme themes
        Object.keys(this.config.schemes).forEach(key => {
            themes.push(key);
        });

        return themes;
    }

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const current = this.currentTheme || 'default';
        const theme = this.getTheme(current);
        
        if (!theme) return;

        const newTheme = theme.type === 'dark' ? 'default' : 'dark';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);

        return newTheme;
    }

    /**
     * Save theme preference to localStorage
     */
    saveTheme(themeName) {
        try {
            localStorage.setItem(this.config.system.storageKey, themeName);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    }

    /**
     * Get saved theme from localStorage
     */
    getSavedTheme() {
        try {
            return localStorage.getItem(this.config.system.storageKey);
        } catch (e) {
            return null;
        }
    }

    /**
     * Clear saved theme preference
     */
    clearSavedTheme() {
        try {
            localStorage.removeItem(this.config.system.storageKey);
        } catch (e) {
            console.warn('Could not clear theme preference:', e);
        }
    }

    /**
     * Apply CSS variables to the document
     */
    applyCSSVariables(colors) {
        const root = document.documentElement;
        
        Object.entries(colors).forEach(([key, value]) => {
            const cssVar = `--${this.camelToKebab(key)}`;
            root.style.setProperty(cssVar, value);
        });
    }

    /**
     * Convert camelCase to kebab-case
     */
    camelToKebab(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Add event listener for theme changes
     */
    onThemeChange(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Remove event listener
     */
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    /**
     * Notify all listeners of theme change
     */
    notifyListeners(themeName, theme) {
        this.listeners.forEach(callback => {
            try {
                callback(themeName, theme);
            } catch (e) {
                console.error('Error in theme change listener:', e);
            }
        });
    }

    /**
     * Export current theme configuration
     */
    exportCurrentTheme() {
        const theme = this.getTheme(this.currentTheme || 'default');
        return {
            name: this.currentTheme || 'default',
            timestamp: new Date().toISOString(),
            theme: theme
        };
    }

    /**
     * Import and apply theme configuration
     */
    importTheme(themeData) {
        if (!themeData || !themeData.theme) {
            console.error('Invalid theme data');
            return false;
        }

        const theme = themeData.theme;
        
        // Add to config if it doesn't exist
        if (theme.name && !this.config[theme.name]) {
            this.config[theme.name] = theme;
        }

        // Apply the theme
        this.applyTheme(theme.name);
        this.saveTheme(theme.name);

        return true;
    }

    /**
     * Create a custom theme from colors
     */
    createCustomTheme(name, colors, type = 'light') {
        const customTheme = {
            name: name,
            type: type,
            colors: { ...this.config.default.colors, ...colors }
        };

        this.config[name] = customTheme;
        return customTheme;
    }

    /**
     * Get current theme information
     */
    getCurrentThemeInfo() {
        const theme = this.getTheme(this.currentTheme || 'default');
        return {
            name: this.currentTheme || 'default',
            type: theme?.type || 'light',
            colors: theme?.colors || {},
            isDark: theme?.type === 'dark'
        };
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick theme toggle function for direct use
 */
function toggleTheme() {
    const manager = window.themeManager || new ThemeManager();
    return manager.toggle();
}

/**
 * Apply specific theme by name
 */
function applyTheme(themeName) {
    const manager = window.themeManager || new ThemeManager();
    return manager.applyTheme(themeName);
}

/**
 * Get available themes
 */
function getAvailableThemes() {
    const manager = window.themeManager || new ThemeManager();
    return manager.getAvailableThemes();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.themeManager = new ThemeManager();
        window.themeManager.initialize();
    });
} else {
    // DOM already loaded, initialize immediately
    window.themeManager = new ThemeManager();
    window.themeManager.initialize();
}

// ============================================================================
// EXPORT
// ============================================================================

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeConfig,
        ThemeManager,
        toggleTheme,
        applyTheme,
        getAvailableThemes
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ThemeConfig = ThemeConfig;
    window.ThemeManager = ThemeManager;
}
