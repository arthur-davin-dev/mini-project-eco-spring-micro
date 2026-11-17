import { useAuth } from '../auth/AuthContext';

export function useI18n() {
    const { t: dict, locale, setLocale } = useAuth();

    const t = (key, fallback) => {
        if (!key) return fallback || '';
        if (dict && dict[key] !== undefined) return dict[key];

        const parts = key.split('.');
        let current = dict;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                current = undefined;
                break;
            }
        }
        if (current !== undefined && typeof current === 'string') {
            return current;
        }

        if (key === 'notfound.title') return locale === 'km' ? 'រកមិនឃើញទំព័រទេ' : 'Page Not Found';
        if (key === 'notfound.body') return locale === 'km' ? 'ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ប្តូរទីតាំង។' : 'The page you are looking for does not exist or has been moved.';

        return fallback || key;
    };

    if (dict) {
        Object.assign(t, dict);
    }

    return { t, locale, setLocale };
}
