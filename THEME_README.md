# Theme Configuration System

A portable, comprehensive theme management system for transferring color schemes and light/dark modes between projects.

## 📁 Files Included

- `theme_config.js` - Main theme configuration and manager
- `THEME_README.md` - This documentation file

## 🚀 Quick Start

### 1. Include in Your Project

```html
<!-- In your HTML file -->
<script src="theme_config.js"></script>
```

### 2. Basic Usage

The theme system auto-initializes on page load. It will:
- Check for saved theme preference in localStorage
- Fall back to system preference (light/dark)
- Apply the appropriate theme automatically

### 3. Manual Theme Control

```javascript
// Toggle between light and dark
toggleTheme();

// Apply specific theme
applyTheme('dark');
applyTheme('warm');
applyTheme('midnight');

// Get available themes
const themes = getAvailableThemes();
console.log(themes); // ['default', 'dark', 'warm', 'cool', 'midnight', 'forest']
```

## 🎨 Available Themes

### Built-in Themes

| Theme Name | Type | Description |
|------------|------|-------------|
| `default` | Light | Your original light theme |
| `dark` | Dark | Your original dark theme |
| `warm` | Light | Warm earth tones |
| `cool` | Light | Cool blue tones |
| `midnight` | Dark | Deep dark blue theme |
| `forest` | Light | Green nature tones |

### Theme Structure

Each theme follows this structure:

```javascript
{
    name: 'theme-name',
    type: 'light', // or 'dark'
    colors: {
        bgPrimary: '#color',
        bgSecondary: '#color',
        textPrimary: '#color',
        textSecondary: '#color',
        borderColor: '#color',
        buttonBg: '#color',
        buttonHover: '#color',
        // ... more colors
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        baseFontSize: '16px',
        lineHeight: 1.5
    }
}
```

## 🎯 CSS Variables Applied

The theme system automatically applies these CSS variables:

```css
--bg-primary
--bg-secondary
--text-primary
--text-secondary
--border-color
--shadow
--button-bg
--button-hover
--modal-bg
--input-bg
--input-border
--dropdown-hover
--dropdown-border
--link-color
--link-hover
--success
--error
```

Use these variables in your CSS:

```css
.my-element {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
}

.my-button {
    background-color: var(--button-bg);
}

.my-button:hover {
    background-color: var(--button-hover);
}
```

## 🔧 Advanced Usage

### Custom Theme Creation

```javascript
// Create a custom theme
const myTheme = window.themeManager.createCustomTheme(
    'ocean', // theme name
    {
        bgPrimary: '#001f3f',
        bgSecondary: '#003366',
        textPrimary: '#7fdbff',
        textSecondary: '#39cccc',
        borderColor: '#0074d9',
        buttonBg: '#003366',
        buttonHover: '#001f3f'
    },
    'dark' // theme type
);

// Apply it immediately
applyTheme('ocean');
```

### Event Listeners

```javascript
// Listen for theme changes
const removeListener = window.themeManager.onThemeChange((themeName, theme) => {
    console.log('Theme changed to:', themeName);
    console.log('Theme type:', theme.type);
    console.log('Colors:', theme.colors);
    
    // Custom logic here
    if (theme.type === 'dark') {
        // Update icons, etc.
    }
});

// Remove listener when done
removeListener();
```

### Export/Import Themes

```javascript
// Export current theme
const exported = window.themeManager.exportCurrentTheme();
console.log(exported);
// {
//     name: 'dark',
//     timestamp: '2026-01-05T01:47:36.000Z',
//     theme: { ... }
// }

// Save to file
const dataStr = JSON.stringify(exported, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'my-theme.json';
link.click();

// Import theme
const themeData = { /* imported JSON data */ };
window.themeManager.importTheme(themeData);
```

### Custom Theme Manager Instance

```javascript
// Create custom instance with specific config
const customConfig = {
    default: {
        name: 'default',
        type: 'light',
        colors: {
            bgPrimary: '#ffffff',
            bgSecondary: '#f8f9fa',
            textPrimary: '#000000',
            textSecondary: '#6c757d',
            borderColor: '#dee2e6',
            buttonBg: '#e9ecef',
            buttonHover: '#dee2e6',
            // ... other colors
        }
    },
    dark: {
        name: 'dark',
        type: 'dark',
        colors: {
            bgPrimary: '#121212',
            bgSecondary: '#1e1e1e',
            textPrimary: '#e0e0e0',
            textSecondary: '#a0a0a0',
            borderColor: '#333333',
            buttonBg: '#1e1e1e',
            buttonHover: '#2d2d2d',
            // ... other colors
        }
    },
    system: {
        prefersDarkScheme: window.matchMedia('(prefers-color-scheme: dark)'),
        storageKey: 'my-app-theme',
        themeAttribute: 'data-theme'
    }
};

const myThemeManager = new ThemeManager(customConfig);
myThemeManager.initialize();

// Use your custom manager
myThemeManager.applyTheme('dark');
```

## 📋 Integration Checklist

When transferring to a new project:

- [ ] Copy `theme_config.js` to your project
- [ ] Include it in your HTML file(s)
- [ ] Update your CSS to use CSS variables
- [ ] Replace hardcoded colors with variables
- [ ] Test theme switching functionality
- [ ] Verify localStorage persistence
- [ ] Check system preference detection
- [ ] Test on different devices/browsers

## 🎨 CSS Migration Guide

### Before (Hardcoded Colors)

```css
body {
    background-color: #e9e6dc;
    color: #333;
}

.button {
    background-color: #d4c5b0;
    color: #333;
}

.button:hover {
    background-color: #c0b098;
}
```

### After (CSS Variables)

```css
body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

.button {
    background-color: var(--button-bg);
    color: var(--text-primary);
}

.button:hover {
    background-color: var(--button-hover);
}
```

### Dark Mode Support

The old way:

```css
/* Light mode */
body {
    background-color: #e9e6dc;
    color: #333;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    body {
        background-color: #1a1a1a;
        color: #c0c0c0;
    }
}

/* Manual dark mode */
[data-theme="dark"] body {
    background-color: #1a1a1a;
    color: #c0c0c0;
}
```

The new way (handled by theme_config.js):

```css
body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

/* No need for media queries or manual overrides - handled by JS */
```

## 🔍 Troubleshooting

### Colors Not Changing

1. **Check CSS variables are being set:**
   ```javascript
   // In browser console
   getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
   ```

2. **Verify theme is applied:**
   ```javascript
   console.log(window.themeManager.getCurrentThemeInfo());
   ```

3. **Check for CSS specificity issues:**
   - Make sure your CSS isn't overriding the variables
   - Use `!important` if needed: `background-color: var(--bg-primary) !important;`

### Theme Not Saving

1. **Check localStorage:**
   ```javascript
   localStorage.getItem('theme-preference');
   ```

2. **Verify localStorage is available:**
   ```javascript
   try {
       localStorage.setItem('test', 'test');
       localStorage.removeItem('test');
       console.log('localStorage works');
   } catch(e) {
       console.log('localStorage not available');
   }
   ```

### System Preference Not Working

1. **Test media query:**
   ```javascript
   window.matchMedia('(prefers-color-scheme: dark)').matches;
   ```

2. **Check event listener:**
   ```javascript
   window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
       console.log('System theme changed:', e.matches ? 'dark' : 'light');
   });
   ```

## 🎯 Best Practices

1. **Use CSS Variables**: Always use the provided CSS variables instead of hardcoded colors
2. **Test Both Themes**: Ensure your UI looks good in both light and dark modes
3. **Respect User Preference**: Don't force a theme - let the system/user decide
4. **Provide Theme Switcher**: Give users control over their theme choice
5. **Persist Choice**: Save user preference to localStorage
6. **Accessibility**: Ensure sufficient contrast ratios in all themes
7. **Performance**: Theme changes are instant, but avoid excessive re-renders

## 📦 Module Usage

If using a module system:

```javascript
import { ThemeManager, ThemeConfig, applyTheme } from './theme_config.js';

// Use as needed
const manager = new ThemeManager();
manager.initialize();
```

## 🔄 Backward Compatibility

If you have existing theme code, you can integrate gradually:

```javascript
// Keep your existing toggle function
function yourExistingToggle() {
    // Your old code...
    
    // Add theme manager integration
    if (window.themeManager) {
        window.themeManager.toggle();
    }
}
```

## 🚀 Performance Notes

- Theme changes are instant (CSS variable updates)
- No page reload required
- Minimal memory footprint
- Works offline
- No external dependencies

## 🌐 Browser Support

- ✅ All modern browsers
- ✅ IE11+ (with polyfills for `matchMedia` and `localStorage`)
- ✅ Mobile browsers
- ✅ Desktop browsers

## 📝 License

Free to use and modify for any project.

---

**Need help?** Check the example implementation in your project or refer to the source code comments in `theme_config.js`.
