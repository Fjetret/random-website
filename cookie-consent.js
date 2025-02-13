// cookie-consent.js
class CookieConsent {
    constructor() {
        this.checkLocation();
    }

    async checkLocation() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            // Show consent for EEA users or if location check fails
            if (data.in_eu || data.error) {
                this.showConsentBanner();
            }
        } catch (error) {
            // Fallback: show consent if location check fails
            this.showConsentBanner();
        }
    }

    showConsentBanner() {
        // Don't show if user already made a choice
        if (localStorage.getItem('cookieConsent')) return;

        const banner = document.createElement('div');
        banner.innerHTML = `
            <div id="cookieConsent" style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                padding: 1rem;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                border-top: 1px solid #eee;
                z-index: 9999;
            ">
                <div style="
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="margin-right: 2rem;">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">We value your privacy</h3>
                        <p style="margin: 0; font-size: 0.9rem; color: #666;">
                            To give you the best experience, we use cookies and similar technologies.
                            Click "Accept All" to allow all data processing.
                        </p>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <button id="customizeBtn" style="
                            padding: 0.5rem 1rem;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 4px;
                            cursor: pointer;
                        ">Customize</button>
                        <button id="acceptAllBtn" style="
                            padding: 0.5rem 1rem;
                            background: #2563eb;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        ">Accept All</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Event listeners
        document.getElementById('acceptAllBtn').addEventListener('click', () => {
            this.saveConsent({
                necessary: true,
                analytics: true,
                marketing: true
            });
            this.hideBanner();
        });

        document.getElementById('customizeBtn').addEventListener('click', () => {
            this.showCustomizeDialog();
        });
    }

    showCustomizeDialog() {
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div id="cookieDialog" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                ">
                    <h3 style="margin: 0 0 1rem 0;">Cookie Settings</h3>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem;">
                            <input type="checkbox" checked disabled> 
                            Necessary (Required)
                        </label>
                        <label style="display: block; margin-bottom: 0.5rem;">
                            <input type="checkbox" id="analyticsCheck"> 
                            Analytics
                        </label>
                        <label style="display: block; margin-bottom: 0.5rem;">
                            <input type="checkbox" id="marketingCheck"> 
                            Marketing
                        </label>
                    </div>
                    <div style="
                        display: flex;
                        justify-content: flex-end;
                        gap: 1rem;
                        margin-top: 2rem;
                    ">
                        <button id="savePrefsBtn" style="
                            padding: 0.5rem 1rem;
                            border: 1px solid #ddd;
                            background: white;
                            border-radius: 4px;
                            cursor: pointer;
                        ">Save Preferences</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('savePrefsBtn').addEventListener('click', () => {
            const prefs = {
                necessary: true,
                analytics: document.getElementById('analyticsCheck').checked,
                marketing: document.getElementById('marketingCheck').checked
            };
            this.saveConsent(prefs);
            this.hideDialog();
            this.hideBanner();
        });
    }

    saveConsent(preferences) {
        localStorage.setItem('cookieConsent', JSON.stringify({
            preferences,
            timestamp: new Date().toISOString()
        }));

        // Update Google Analytics settings if it exists
        if (window.gtag) {
            gtag('consent', 'update', {
                'analytics_storage': preferences.analytics ? 'granted' : 'denied',
                'ad_storage': preferences.marketing ? 'granted' : 'denied'
            });
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) banner.remove();
    }

    hideDialog() {
        const dialog = document.getElementById('cookieDialog');
        if (dialog) dialog.remove();
    }
}
