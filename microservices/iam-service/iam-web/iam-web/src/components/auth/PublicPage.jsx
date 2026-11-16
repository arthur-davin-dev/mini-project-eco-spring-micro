import ConnectedAppsPage from './ConnectedAppsPage'
import ConsentPage from './ConsentPage'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import ForgotPasswordPage from './ForgotPasswordPage'

export default function PublicPage({dark, setDark}) {
    switch (window.location.pathname) {
        case '/login':
            return <LoginPage dark={dark} setDark={setDark}/>
        case '/register':
            return <RegisterPage dark={dark} setDark={setDark}/>
        case '/forgot-password':
        case '/reset-password':
            return <ForgotPasswordPage dark={dark} setDark={setDark}/>
        case '/oauth2/consent':
            return <ConsentPage dark={dark} setDark={setDark}/>
        case '/profile/apps':
            return <ConnectedAppsPage dark={dark} setDark={setDark}/>
        default:
            return <LoginPage dark={dark} setDark={setDark}/>
    }
}
