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

function calculateContrastRatio(luminance1, luminance2) {
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
}

function getOptimalTextColor(bgHue, bgSat, bgLight) {
    // Calculate complementary hue (opposite on color wheel)
    const complementaryHue = (bgHue + 180) % 360;
    
    // Calculate analogous hues for secondary text
    const analogousHue = (complementaryHue + 40) % 360;
    
    // Adjust saturation based on background
    const textSat = Math.min(bgSat + 20, 100);
    
    // Calculate optimal lightness based on background
    const bgRGB = hslToRgb(bgHue, bgSat, bgLight);
    const bgLuminance = getLuminance(...bgRGB);
    
    let mainLight, secondaryLight;
    if (bgLuminance > 0.3) { // Much lower threshold for earlier switch to dark text
        // Dark text on light background
        mainLight = 15; // Even darker for better contrast
        secondaryLight = 95; // Invert secondaryLight
    } else {
        // Light text on dark background
        mainLight = 95; // Even lighter for better contrast
        secondaryLight = 15; // Invert secondaryLight
    }
    
    let mainLightAdjusted = mainLight;
    let contrastRatio = 0;
    let maxAdjustments = 200; // Limit adjustments to prevent infinite loops
    const adjustmentIncrement = 0.1;

    for (let i = 0; i < maxAdjustments; i++) {
        const textRGB = hslToRgb(complementaryHue, textSat, mainLightAdjusted);
        const textLuminance = getLuminance(...textRGB);
        contrastRatio = calculateContrastRatio(bgLuminance, textLuminance);

        if (contrastRatio >= 7.0) {
            break;
        }

        // Adjust lightness based on current contrast
        if (bgLuminance > textLuminance) {
            mainLightAdjusted -= adjustmentIncrement; // Darken text
        } else {
            mainLightAdjusted += adjustmentIncrement; // Lighten text
        }

        // Ensure lightness stays within bounds
        mainLightAdjusted = Math.max(0, Math.min(100, mainLightAdjusted));
    }

    return {
        main: { hue: complementaryHue, sat: textSat, light: mainLightAdjusted },
        secondary: { hue: bgHue, sat: textSat - 10, light: secondaryLight }
    };
}

function updateColors() {
    const sliderValue = themeSlider.value;
    const hue = 40; // Warm base hue
    const saturation = Math.max(9.1, 20 - sliderValue/2);
    // Faster lightness progression
    const lightness = Math.min(85, 12 + (sliderValue * 0.73)); // Steeper scaling from 0-70%

    // Get optimal text colors based on background
    const textColors = getOptimalTextColor(hue, saturation, lightness);
    
    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const textColor = `hsl(${textColors.main.hue}, ${textColors.main.sat}%, ${textColors.main.light}%)`;
    const secondaryTextColor = `hsl(${textColors.secondary.hue}, ${textColors.secondary.sat}%, ${textColors.secondary.light}%)`;
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
            background-color: rgba(0, 0, 0, 0.6) !important;
        }
        .modal-content {
            background-color: ${backgroundColor}
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
            color: ${textColor} !important;
        }
               
        .modal-content {
            background-color: ${backgroundColor} !important;  /* Set modal background */
            color: ${textColor} !important;  /* Set modal text color */
        }
        
        /* Style all form inputs with a slightly darker/lighter shade */
        input,
        textarea,
        select {
            background-color: ${secondaryColor} !important;
            color: ${textColor} !important;
            border-color: ${buttonBorderColor} !important;
        }

        /* Make bpm input and beats selector background transparent */
        #controls input#bpm,
        #controls select#beats {
            background-color: transparent !important;
        }

        /* Style metronome elements */
        #controls #metronome {
            color: ${textColor} !important;
        }
        #controls label,
        #controls input,
        #controls select {
            color: ${textColor} !important;
            border-color: ${buttonBorderColor} !important;
        }
    `;

    const isDarkTheme = lightness < 50;

    const hamburgerIcon = document.getElementById('hamburgerIcon');
    if (hamburgerIcon) {
        hamburgerIcon.src = isDarkTheme ? 'img/hamburger-dark.svg' : 'img/hamburger-light.svg';
    }
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
