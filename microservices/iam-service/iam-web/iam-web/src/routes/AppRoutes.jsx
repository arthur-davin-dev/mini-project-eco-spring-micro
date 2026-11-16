import ProtectedRoute from './ProtectedRoute'
import PublicPage from '../components/auth/PublicPage'

export default function AppRoutes({dark, setDark}) {
    if (['/login', '/register', '/forgot-password', '/reset-password', '/oauth2/consent', '/profile/apps'].includes(window.location.pathname)) {
        return <PublicPage dark={dark} setDark={setDark}/>
    }
    return <ProtectedRoute dark={dark} setDark={setDark}/>
}
