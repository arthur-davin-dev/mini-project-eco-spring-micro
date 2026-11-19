import {useMemo} from 'react'
import {Eye, EyeOff} from 'lucide-react'

/** Reads ?lang=, falling back to the saved locale. Returns true for Khmer. */
export function getInitialIsKm() {
    if (typeof window === 'undefined') return false
    const lang = new URLSearchParams(window.location.search).get('lang')
    if (lang) return lang === 'km'
    try {
        return localStorage.getItem('iam-locale') === 'km' || localStorage.getItem('iam-lang') === 'km'
    } catch {
        return false
    }
}

/** Memoized query string for the current page. */
export function useAuthQuery() {
    return useMemo(
        () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''),
        [],
    )
}

/** Show/hide button for password fields. */
export function PasswordToggle({visible, onToggle, showLabel, hideLabel}) {
    const label = visible ? hideLabel : showLabel
    const Icon = visible ? EyeOff : Eye
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={visible}
            aria-label={label}
            title={label}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
            <Icon className="size-4" aria-hidden="true"/>
        </button>
    )
}

/** Returns a copy of `errors` without `field`. Returns the same object if the field has no error. */
export function withoutError(errors, field) {
    if (!errors[field]) return errors
    const next = {...errors}
    delete next[field]
    return next
}