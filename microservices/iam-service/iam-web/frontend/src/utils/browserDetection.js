export async function detectBrowserAndDevice() {
    let browser = 'Chrome';
    const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';

    // 1. Official Brave API detection
    try {
        if (typeof window !== 'undefined' && window.navigator?.brave && typeof window.navigator.brave.isBrave === 'function') {
            const isBrave = await window.navigator.brave.isBrave();
            if (isBrave) {
                browser = 'Brave';
            }
        }
    } catch {
        // ignore
    }

    // 2. Client Hints Brands
    if (browser === 'Chrome' && typeof navigator !== 'undefined' && navigator.userAgentData?.brands) {
        const brandNames = navigator.userAgentData.brands.map((b) => (b.brand || '').toLowerCase());
        if (brandNames.some((b) => b.includes('brave'))) browser = 'Brave';
        else if (brandNames.some((b) => b.includes('edg'))) browser = 'Edge';
        else if (brandNames.some((b) => b.includes('opera') || b.includes('opr'))) browser = 'Opera';
        else if (brandNames.some((b) => b.includes('vivaldi'))) browser = 'Vivaldi';
        else if (brandNames.some((b) => b.includes('chrome'))) browser = 'Chrome';
    }

    // 3. User-Agent fallback
    if (browser === 'Chrome') {
        if (/brave/i.test(ua)) browser = 'Brave';
        else if (/edg/i.test(ua)) browser = 'Edge';
        else if (/opr|opera/i.test(ua)) browser = 'Opera';
        else if (/vivaldi/i.test(ua)) browser = 'Vivaldi';
        else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
        else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
        else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
        else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
        else browser = 'Web Browser';
    }

    // 4. Operating System
    let os = 'Desktop';
    if (/android/i.test(ua)) os = 'Android';
    else if (/iphone/i.test(ua)) os = 'iPhone';
    else if (/ipad/i.test(ua)) os = 'iPad';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/windows/i.test(ua)) os = 'Windows PC';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/cros/i.test(ua)) os = 'Chrome OS';

    const device = `${os} (${browser} Session)`;

    if (typeof document !== 'undefined') {
        try {
            document.cookie = `client_browser=${encodeURIComponent(browser)}; path=/; max-age=31536000; SameSite=Lax`;
            document.cookie = `client_device=${encodeURIComponent(device)}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
            // ignore
        }
    }

    return { browser, os, device };
}

export function getCachedBrowser() {
    if (typeof document === 'undefined') return 'Web Browser';
    const match = document.cookie.match(/(?:^|;\s*)client_browser=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}
