import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import en from '../i18n/en.json'
import km from '../i18n/km.json'
import {accountApi as profileApi} from '../features/account/api/accountApi'
import {preferenceStorage, sessionStorageService} from '../services/storage/sessionStorage'

const IamContext = createContext(null)

export function IamProvider({children}) {
    const [locale, setLocaleState] = useState(preferenceStorage.getLocale())
    const [token, setToken] = useState(sessionStorageService.getToken())
    const [user, setUser] = useState(null)
    const [identities, setIdentities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const t = locale === 'km' ? km : en

    useEffect(() => {
        document.documentElement.lang = locale
    }, [locale])

    const loadAccount = useCallback(async (accessToken) => {
        if (!accessToken) {
            setUser(null)
            setIdentities([])
            return
        }
        setLoading(true)
        setError('')
        try {
            const [profile, linkedAccounts] = await Promise.all([
                profileApi.getProfile(accessToken),
                profileApi.getLinkedAccounts(accessToken),
            ])
            setUser(profile)
            setIdentities(linkedAccounts)
        } catch {
            setError(t.apiError)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [t.apiError])

    useEffect(() => {
        if (token) {
            loadAccount(token)
            return
        }
        let cancelled = false
        const controller = new AbortController()
        const timeoutId = window.setTimeout(() => controller.abort(), 5000)
        setLoading(true)
        fetch('/account/session', {credentials: 'same-origin', signal: controller.signal})
            .then(async (response) => {
                if (!response.ok) throw new Error('No signed-in account session')
                return response.json()
            })
            .then((account) => {
                if (cancelled) return
                setUser(account.user)
                setIdentities(account.identities || [])
                setError('')
            })
            .catch(() => {
                if (!cancelled) {
                    setUser(null)
                    setIdentities([])
                }
            })
            .finally(() => {
                window.clearTimeout(timeoutId)
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
            window.clearTimeout(timeoutId)
            controller.abort()
        }
    }, [token, loadAccount])

    const value = useMemo(() => ({
        locale,
        setLocale: (nextLocale) => {
            preferenceStorage.setLocale(nextLocale)
            setLocaleState(nextLocale)
        },
        t,
        token,
        connectToken: (nextToken) => {
            sessionStorageService.setToken(nextToken)
            setToken(nextToken)
        },
        clearToken: () => {
            sessionStorageService.clearToken()
            setToken('')
            setUser(null)
            setIdentities([])
        },
        user,
        setUser,
        identities,
        setIdentities,
        loading,
        error,
        setError,
        loadAccount,
    }), [locale, t, token, user, identities, loading, error, loadAccount])

    return <IamContext.Provider value={value}>{children}</IamContext.Provider>
}

export function useIam() {
    const context = useContext(IamContext)
    if (!context) throw new Error('useIam must be used within IamProvider')
    return context
}
