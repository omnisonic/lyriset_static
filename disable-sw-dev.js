/**
 * Service Worker Disabler for Development
 * 
 * This script can be used to completely prevent service worker registration
 * during local development. Include it BEFORE your main app scripts.
 * 
 * Usage: Add this script tag BEFORE your other scripts:
 * <script src="disable-sw-dev.js"></script>
 */

// Method 1: Override serviceWorker.register
if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    const originalRegister = navigator.serviceWorker.register;
    navigator.serviceWorker.register = function() {
        console.log('Service Worker registration blocked by development mode');
        return Promise.reject(new Error('Service Worker disabled for development'));
    };
    
    // Method 2: Block any attempts to register
    Object.defineProperty(navigator, 'serviceWorker', {
        get: function() {
            return {
                register: function() {
                    console.log('Service Worker registration blocked by development mode');
                    return Promise.reject(new Error('Service Worker disabled for development'));
                },
                getRegistration: function() {
                    return Promise.resolve(null);
                },
                getRegistrations: function() {
                    return Promise.resolve([]);
                },
                ready: Promise.resolve(null),
                controller: null,
                addEventListener: function() {},
                removeEventListener: function() {}
            };
        },
        configurable: false,
        enumerable: true
    });
}

// Method 3: Remove any existing service workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
            registration.unregister().then(function(success) {
                if (success) {
                    console.log('Service Worker unregistered:', registration.scope);
                }
            });
        }
    });
}

console.log('Service Worker disabler loaded - Service Workers are disabled for development');
