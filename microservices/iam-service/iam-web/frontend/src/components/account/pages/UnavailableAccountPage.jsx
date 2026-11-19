import {Fragment} from 'react'
import {sectionIcons, sectionTitleKeys} from '../../../utils/accountFormat'

export default function UnavailableAccountPage({page, t, onBack}) {
    const title = t[sectionTitleKeys[page]] || t.unavailable
    const previewItems = {
        sessions: ['Device details', 'Browser & location', 'Last activity'],
        sessionManagement: ['End one session', 'Sign out everywhere', 'Review active devices'],
        history: ['Sign-in outcome', 'Timestamp & device', 'Suspicious attempts'],
        activity: ['Password changes', 'Profile updates', 'Account events'],
        adminOverview: ['Users', 'Roles', 'Permissions', 'OAuth clients'],
        users: ['Create and update users', 'Activate or lock accounts', 'Review account details'],
        userRoles: ['Assign roles', 'Change assignments', 'Revoke roles'],
        userPermissions: ['Grant permissions', 'Review assignments', 'Revoke permissions'],
        userSessions: ['View user sessions', 'End one session', 'Sign out all devices'],
        userHistory: ['Successful sign-ins', 'Failed attempts', 'Suspicious activity'],
        roles: ['Create and edit roles', 'Assign permissions', 'Remove roles'],
    }
    const items = previewItems[page] || []
    return <section
        className="mx-auto grid max-w-2xl justify-items-center rounded-xl border border-[var(--color-line)] bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div
            className="relative mb-5 grid size-24 place-items-center rounded-full bg-violet-50 text-4xl text-violet-600 dark:bg-violet-950">{sectionIcons[page]}<span
            className="absolute -right-1 top-1 text-sm text-amber-400">✦</span></div>
        <span
            className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">• {t.unavailable}</span>
        <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h2><p
        className="mt-2 max-w-md text-xs leading-5 text-slate-500">{t.unavailableText}</p>
        <div
            className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-500">{items.map((item, index) =>
            <Fragment key={item}>{index > 0 && <span className="text-slate-300">·</span>}{item}</Fragment>)}</div>
        <button
            className="mt-6 h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            onClick={onBack}>{t.browse} →
        </button>
    </section>
}
