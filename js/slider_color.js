const themeSlider = document.getElementById('themeSlider');
window.isColorSliderActive = false;

// Helper functions for color calculations
function getLuminance(r, g, b) {
    let [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getOptimalTextColor(bgHue, bgSat, bgLight) {
    // Calculate complementary hue (opposite on color wheel)
    const complementaryHue = (bgHue + 180) % 360;
    
    // Calculate analogous hues for secondary text
    const analogousHue = (complementaryHue + 30) % 360;
    
    // Adjust saturation based on background
    const textSat = Math.min(bgSat + 20, 100);
    
    // Calculate optimal lightness based on background
    const bgRGB = hslToRgb(bgHue, bgSat, bgLight);
    const bgLuminance = getLuminance(...bgRGB);
    
    let mainLight, secondaryLight;
    if (bgLuminance > 0.3) { // Much lower threshold for earlier switch to dark text
        // Dark text on light background
        mainLight = 15; // Even darker for better contrast
        secondaryLight = 25;
    } else {
        // Light text on dark background
        mainLight = 95; // Even lighter for better contrast
        secondaryLight = 85;
    }
    
    return {
        main: { hue: complementaryHue, sat: textSat, light: mainLight },
        secondary: { hue: analogousHue, sat: textSat - 10, light: secondaryLight }
    };
}

function updateColors() {
    const sliderValue = themeSlider.value;
    const hue = 30; // Warm base hue
    const saturation = Math.max(20, 60 - sliderValue/2);
    // Faster lightness progression
    const lightness = Math.min(85, (sliderValue * 0.7)); // Steeper scaling from 0-70%

    // Get optimal text colors based on background
    const textColors = getOptimalTextColor(hue, saturation, lightness);
    
    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const textColor = `hsl(${textColors.main.hue}, ${textColors.main.sat}%, ${textColors.main.light}%)`;
    const secondaryColor = `hsl(${textColors.secondary.hue}, ${textColors.secondary.sat}%, ${textColors.secondary.light}%)`;

    const buttonBorderColor = textColor;  // Use the same color for the button border


    let styleEl = document.getElementById('dynamic-text-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-text-styles';
        document.head.appendChild(styleEl);
    }

    // ... existing code for style rules ...
    styleEl.textContent = `
        body,
        body .container,
        body .container * {
            background-color: ${backgroundColor} !important;
        }
        body .lyrics,
        body #lyricsDisplay,
        body .lyrics div,
        body .lyrics span,
        body #songTitle,
        body #songArtist,
        body .text-light,
        body h3,
        body p {
            color: ${textColor} !important;
        }
        body .text-secondary,
        body .artist {
            color: ${secondaryColor} !important;
        }
        /* Override any Bootstrap text colors */
        [class*="text-"] {
            color: ${textColor} !important;
        }
        button, .btn {
            border-color: ${buttonBorderColor} !important;
            color: ${textColor} !important; /* Ensure the button text color is also readable */
        }

        /* Style navbar brand */
        .navbar-brand {
            color: ${backgroundColor} !important;
        }
        /* Preserve specific exceptions */
        .modal {
            background-color: ${backgroundColor} !important;    
            color: ${textColor} !important;
        }
        .btn,
        .dropdown-menu,
        .dropdown-item {
            background-color: ${backgroundColor} !important;
        }
        
        /* Style dropdown items */
        .dropdown-menu .dropdown-item,
        .dropdown-menu .dropdown-header {
            color: ${textColor} !important;
        }
        
        /* Style dropdown item on hover */
        .dropdown-menu .dropdown-item:hover,
        .dropdown-menu .dropdown-item:focus {
            background-color: ${secondaryColor} !important;
            color: ${backgroundColor} !important;
        }
               
        .modal-content {
            background-color: ${secondaryColor} !important;  /* Set modal background */
            color: ${backgroundColor} !important;  /* Set modal text color */
        }
        
        /* Style all form inputs with a slightly darker/lighter shade */
        input,
        textarea,
        select {
            background-color: ${backgroundColor} !important;
            color: ${textColor} !important;
            border-color: ${buttonBorderColor} !important;
        }
    `;
}

themeSlider.addEventListener('input', () => {
    window.isColorSliderActive = true;
    updateColors();
});

themeSlider.addEventListener('change', () => {
    window.isColorSliderActive = false;
    updateColors();
});

window.addEventListener('DOMContentLoaded', () => {
    updateColors();
});
