import {useEffect, useState} from 'react'
import AuthShell from '../ui/AuthShell'
import CsrfField from '../ui/CsrfField'

export default function ConnectedAppsPage({dark, setDark}) {
    const [apps, setApps] = useState([])
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        fetch('/profile/apps/data', {credentials: 'same-origin'})
            .then(response => response.ok ? response.json() : Promise.reject())
            .then(setApps)
            .catch(() => setFailed(true))
    }, [])

    return (
        <AuthShell title="Connected applications" dark={dark} setDark={setDark}>
            <p className="text-sm text-slate-500">Applications with access to your account.</p>
            {failed && <p className="my-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">Could not load connected
                applications.</p>}
            {!failed && apps.length === 0 && <p className="text-sm text-slate-500">No connected applications.</p>}
            {apps.map(app => (
                <article className="my-3 rounded-xl border border-slate-200 p-4" key={app.registeredClientId}>
                    <b>{app.clientName}</b>
                    <p className="my-2 text-xs text-slate-500">{app.scopes.join(', ') || 'No permissions listed'}</p>
                    <form method="post" action={`/profile/apps/${app.registeredClientId}/revoke`}>
                        <CsrfField/>
                        <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700">Revoke
                            access
                        </button>
                    </form>
                </article>
            ))}
            <p className="mt-4 text-xs"><a className="font-semibold text-violet-700" href="/account">Back to account</a>
            </p>
        </AuthShell>
    )
}
