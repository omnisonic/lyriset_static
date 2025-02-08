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
    const bgRGB = hslToRgb(bgHue, bgSat, bgLight);
    const bgLuminance = getLuminance(...bgRGB);
    
    // Calculate contrast with potential text colors
    const blackLuminance = getLuminance(0, 0, 0);
    const whiteLuminance = getLuminance(255, 255, 255);
    
    const contrastWithBlack = (Math.max(bgLuminance, blackLuminance) + 0.05) / 
                             (Math.min(bgLuminance, blackLuminance) + 0.05);
    const contrastWithWhite = (Math.max(bgLuminance, whiteLuminance) + 0.05) / 
                             (Math.min(bgLuminance, whiteLuminance) + 0.05);
    
    return contrastWithBlack > contrastWithWhite ? 
        { main: 0, secondary: 20 } : 
        { main: 100, secondary: 80 };
}

function updateColors() {
    const sliderValue = themeSlider.value;
    const hue = 30; // Warm base hue
    const saturation = Math.max(20, 60 - sliderValue/2);
    const lightness = Math.pow(sliderValue/100, 1.5) * 95;

    // Get optimal text colors based on background
    const textColors = getOptimalTextColor(hue, saturation, lightness);
    
    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const textColor = `hsl(${hue}, 20%, ${textColors.main}%)`;
    const secondaryColor = `hsl(${hue}, 20%, ${textColors.secondary}%)`;

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
        .navbar { background-color: ${secondaryColor}}
        .modal {
            background-color: ${backgroundColor} !important;    
            color: ${textColor} !important;
        }
        .btn,
        .dropdown-menu {
            background-color: ${backgroundColor} !important;
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
