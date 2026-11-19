import AuthShell from '../ui/AuthShell'
import CsrfField from '../ui/CsrfField'

export default function ConsentPage({dark, setDark}) {
    const query = new URLSearchParams(window.location.search)
    const clientId = query.get('client_id')
    const state = query.get('state')
    const scopes = query.getAll('scope').flatMap(scope => scope.split(' ')).filter(Boolean)

    return (
        <AuthShell title="Authorize access" dark={dark} setDark={setDark}>
            {!clientId || !state ? (
                <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">This authorization request is invalid.</p>
            ) : (
                <>
                    <p className="text-sm text-slate-600"><b>{clientId}</b> is requesting access to your account.</p>
                    <p className="mt-3 text-sm text-slate-600">Review the requested permissions:</p>
                    <form method="post" action="/oauth2/authorize"
                          className="my-5 grid gap-3 [&_label]:flex [&_label]:items-center [&_label]:gap-2 [&_label]:text-sm [&_button]:h-10 [&_button]:rounded-lg [&_button]:bg-violet-700 [&_button]:px-4 [&_button]:text-xs [&_button]:font-semibold [&_button]:text-white">
                        <CsrfField/>
                        <input type="hidden" name="client_id" value={clientId}/>
                        <input type="hidden" name="state" value={state}/>
                        {scopes.map(scope => (
                            <label className="flex items-center gap-2 text-sm" key={scope}>
                                <input type="checkbox" name="scope" value={scope} defaultChecked/>{scope}
                            </label>
                        ))}
                        {!scopes.length && <p>No additional permissions requested.</p>}
                        <div className="flex gap-2">
                            <button name="user_oauth_approval" value="true">Allow</button>
                            <button className="border border-slate-200 bg-white text-slate-700"
                                    name="user_oauth_approval" value="false">Cancel
                            </button>
                        </div>
                    </form>
                </>
            )}
        </AuthShell>
    )
}
