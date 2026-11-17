const TOKEN_KEY = 'iam-token'
const LOCALE_KEY = 'iam-locale'

export const sessionStorageService = {
    getToken: () => window.sessionStorage.getItem(TOKEN_KEY) || '',
    setToken: (token) => window.sessionStorage.setItem(TOKEN_KEY, token),
    clearToken: () => window.sessionStorage.removeItem(TOKEN_KEY),
}

export const preferenceStorage = {
    getLocale: () => window.localStorage.getItem(LOCALE_KEY) || 'en',
    setLocale: (locale) => window.localStorage.setItem(LOCALE_KEY, locale),
}
