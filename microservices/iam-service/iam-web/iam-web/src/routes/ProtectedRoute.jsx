import {useEffect} from 'react'
import AccountPage from '../components/profile/AccountPage'
import AccountLoadingSkeleton from '../components/profile/AccountLoadingSkeleton'
import {useIam} from '../hooks/useIam'

export default function ProtectedRoute({dark, setDark}) {
    const {token, user, loading, t, clearToken} = useIam()

    useEffect(() => {
        if (!loading && !user && token) {
            clearToken()
        } else if (!loading && !user) {
            window.location.replace('/login?returnTo=%2Faccount')
        }
    }, [loading, token, user, clearToken])

    if (loading && !user) {
        return <AccountLoadingSkeleton label={t.loading}/>
    }

    // A hosted account session is authenticated by the server-side browser
    // session, so it does not have a development bearer token in storage.
    if (!user) {
        return <AccountLoadingSkeleton label={t.loading}/>
    }

    return <AccountPage dark={dark} setDark={setDark}/>
}
