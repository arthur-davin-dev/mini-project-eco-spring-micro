import {formatMemberDate} from '../../utils/accountFormat'
import {Badge} from '../ui/badge'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card'
import Avatar from '../common/Avatar'
import {
    BadgeCheck,
    CalendarDays,
    ChevronRight,
    CircleCheck,
    Link2,
    Pencil,
    ShieldCheck,
    UserRound,
    UsersRound
} from 'lucide-react'

export default function DashboardPage({user, identities, locale, t, setPage}) {
    const roles = (user.roles || []).map((role) => typeof role === 'string' ? role : role.name)
    const stats = [
        {Icon: UsersRound, label: t.dashboardRoles, value: roles.length},
        {Icon: Link2, label: t.dashboardLinked, value: identities.length},
        {Icon: CircleCheck, label: t.accountStatus, value: user.enabled ? t.active : t.inactive},
        {Icon: CalendarDays, label: t.memberSince, value: formatMemberDate(user.createdAt, locale)},
    ]
    const shortcuts = [
        ['profile', UserRound, t.profile, t.dashboardProfileHint],
        ['security', ShieldCheck, t.security, t.dashboardSecurityHint],
        ['linked', Link2, t.linked, t.dashboardLinkedHint],
    ]

    return <>
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={t.dashboardSummary}>
            {stats.map(({Icon, ...stat}) => <Card className="min-h-20 gap-2 p-4" key={stat.label}>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Icon
                    className="size-4 text-violet-600" strokeWidth={1.8} aria-hidden="true"/>{stat.label}</div>
                <strong className="mt-2 block text-lg font-bold text-slate-800 dark:text-white">{stat.value}</strong>
            </Card>)}
        </section>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(230px,.8fr)]">
            <Card className="gap-0 p-5">
                <CardHeader className="!flex !items-center gap-3 !p-0">
                    <span
                        className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700"><UserRound
                        className="size-4" strokeWidth={1.8}/></span>
                    <div className="min-w-0"><CardTitle
                        className="text-sm text-slate-800 dark:text-white">{t.dashboardAccountDetails}</CardTitle><CardDescription
                        className="mt-1 text-xs">{t.profileText}</CardDescription></div>
                    <button
                        className="ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => setPage('profile')}><Pencil className="size-3.5"/>{t.edit}</button>
                </CardHeader>
                <CardContent className="!p-0">
                    <div
                        className="mt-5 flex items-center gap-3 border-b border-[var(--color-line)] pb-4 dark:border-slate-700">
                        <Avatar user={user} className="size-11 text-sm"/>
                        <div className="grid gap-1"><strong
                            className="text-sm text-slate-800 dark:text-white">{user.name || user.username}</strong><span
                            className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</span></div>
                    </div>
                    <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                        <div>
                            <dt className="mb-1 text-[11px] text-slate-500">{t.firstName}</dt>
                            <dd className="text-xs text-slate-800 dark:text-slate-100">{user.givenName || '—'}</dd>
                        </div>
                        <div>
                            <dt className="mb-1 text-[11px] text-slate-500">{t.lastName}</dt>
                            <dd className="text-xs text-slate-800 dark:text-slate-100">{user.familyName || '—'}</dd>
                        </div>
                        <div>
                            <dt className="mb-1 text-[11px] text-slate-500">{t.email}</dt>
                            <dd className="flex flex-wrap items-center gap-2 text-xs text-slate-800 dark:text-slate-100">{user.email || '—'}{user.emailVerified &&
                                <Badge variant="success"><BadgeCheck className="size-3"/>{t.verified}</Badge>}</dd>
                        </div>
                        <div>
                            <dt className="mb-1 text-[11px] text-slate-500">{t.phone}</dt>
                            <dd className="text-xs text-slate-800 dark:text-slate-100">{user.phoneNumber || '—'}</dd>
                        </div>
                        <div className="border-t border-[var(--color-line)] pt-3 sm:col-span-2 dark:border-slate-700">
                            <dt className="mb-2 text-[11px] text-slate-500">{t.roles}</dt>
                            <dd className="flex flex-wrap gap-2">{roles.length ? roles.map((role) => <Badge
                                variant="secondary" key={role}>{role}</Badge>) : '—'}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
            <section className="grid gap-2.5">
                <h2 className="mb-1 text-sm font-medium text-slate-800 dark:text-white">{t.dashboardShortcuts}</h2>
                {shortcuts.map(([page, Icon, title, description]) => <button
                    className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-line)] bg-white p-3 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    key={page} onClick={() => setPage(page)}>
                    <span
                        className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700"><Icon
                        className="size-4" strokeWidth={1.8}/></span>
                    <span className="grid min-w-0 gap-1"><strong
                        className="text-xs text-slate-800 dark:text-white">{title}</strong><small
                        className="text-[11px] text-slate-500 dark:text-slate-400">{description}</small></span>
                    <ChevronRight className="ml-auto size-4 text-slate-400"/>
                </button>)}
            </section>
        </div>
    </>
}