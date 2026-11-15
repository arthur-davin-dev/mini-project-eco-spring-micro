// import {useEffect, useState} from 'react'
//
// export default function CsrfField() {
//     const [token, setToken] = useState(null)
//
//     useEffect(() => {
//         fetch('/account/csrf', {credentials: 'same-origin'})
//             .then(response => {
//                 if (!response.ok) throw new Error('Could not prepare a secure form')
//                 return response.json()
//             })
//             .then(setToken)
//             .catch(() => setToken({error: true}))
//     }, [])
//
//     if (!token) return <p className="text-xs text-slate-500">Preparing secure form…</p>
//     if (token.error) return <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">Could not load the security
//         token. Refresh and try
//         again.</p>
//
//     return <input type="hidden" name={token.parameterName} value={token.token}/>
// }


import {useCallback, useEffect, useState} from 'react'

export default function CsrfField({onReady}) {
    const [state, setState] = useState({status: 'loading', token: null})

    const load = useCallback(signal => {
        setState({status: 'loading', token: null})
        onReady?.(false)
        fetch('/account/csrf', {credentials: 'same-origin', signal})
            .then(response => {
                if (!response.ok) throw new Error('csrf')
                return response.json()
            })
            .then(token => {
                setState({status: 'ready', token})
                onReady?.(true)
            })
            .catch(error => {
                if (error.name === 'AbortError') return
                setState({status: 'error', token: null})
                onReady?.(false)
            })
    }, [onReady])

    useEffect(() => {
        const controller = new AbortController()
        load(controller.signal)
        return () => controller.abort()
    }, [load])

    if (state.status === 'loading') {
        return <p className="text-xs text-slate-500" role="status">Preparing secure form…</p>
    }

    if (state.status === 'error') {
        return (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-xs text-red-700
                            dark:bg-red-950 dark:text-red-200" role="alert">
                <span>Could not load the security token.</span>
                <button type="button" className="font-semibold underline" onClick={() => load()}>
                    Retry
                </button>
            </div>
        )
    }

    return <input type="hidden" name={state.token.parameterName} value={state.token.token}/>
}