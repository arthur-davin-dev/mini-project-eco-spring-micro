import {useEffect, useState} from 'react'
import {IamProvider} from './contexts/IamContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
    const [dark, setDark] = useState(() => localStorage.getItem('iam-theme') === 'dark')

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('iam-theme', dark ? 'dark' : 'light')
    }, [dark])

    return <IamProvider><AppRoutes dark={dark} setDark={setDark}/></IamProvider>
}
