import {useEffect, useState} from 'react'
import {
    User,
    Shield,
    Link as LinkIcon,
    MonitorSmartphone,
    ArrowUpRight,
    ArrowRight,
    Check
} from 'lucide-react'
import Detail from '../common/Detail'
import Field from '../common/Field'
import {formatMemberDate} from '../../utils/accountFormat'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select'
import Avatar from '../common/Avatar'

const card = 'rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'
const button = 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

export default function ProfilePage({user, identities, roleNames, locale, t, working, onSave, setPage}) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})

    useEffect(() => setForm({
        givenName: user.givenName || '', nickname: user.nickname || '',
        phoneNumber: user.phoneNumber || '', pictureUrl: user.pictureUrl || '', locale: user.locale || locale,
    }), [user, locale])

    async function submitProfile(event) {
        event.preventDefault()
        if (await onSave(form)) setEditing(false)
    }

    return (
        <div className="grid gap-4">
            <section className="flex flex-wrap items-center gap-4 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-white p-5 dark:border-violet-950 dark:from-violet-950/50 dark:to-slate-900">
                <Avatar user={user} className="size-14 bg-violet-200 text-lg"/>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                        {user.name || user.username}
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${user.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {user.enabled ? t.active : t.inactive}
                        </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">@{user.username} · {user.email}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] text-emerald-700 dark:bg-slate-800">
                            <Check className="size-3" strokeWidth={3} /> {user.emailVerified ? t.verified : 'Email'}
                        </span>
                        {roleNames.slice(0, 2).map((role) => (
                            <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] text-violet-800 dark:bg-violet-900 dark:text-violet-200" key={role}>
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="text-xs text-slate-500">
                    <small className="block">{t.memberSince}</small>
                    <b className="mt-1 block text-slate-700 dark:text-slate-200">{formatMemberDate(user.createdAt, locale)}</b>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    [t.overviewCards[0], user.phoneNumber ? 'Complete' : 'Add details', <User className="size-5" key="profile" />, 'profile'],
                    [t.overviewCards[1], 'Update password', <Shield className="size-5" key="security" />, 'security'],
                    [t.overviewCards[2], `${identities.length} connected`, <LinkIcon className="size-5" key="linked" />, 'linked'],
                    [t.overviewCards[3], 'View devices', <MonitorSmartphone className="size-5" key="sessions" />, 'sessions']
                ].map(([label, value, icon, page]) => (
                    <button className={`${card} flex min-h-18 items-center gap-3 p-3 text-left transition hover:border-violet-300`} key={label} onClick={() => setPage(page)}>
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700">{icon}</span>
                        <span className="grid min-w-0 gap-1">
                            <small className="truncate text-[10px] text-slate-500">{label}</small>
                            <b className="truncate text-xs text-slate-800 dark:text-white">{value}</b>
                        </span>
                        <ArrowUpRight className="ml-auto size-4 text-slate-400" />
                    </button>
                ))}
            </section>

            <section className={card}>
                <header className="mb-5 flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700">
                        <User className="size-5" />
                    </span>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white">{t.profile}</h2>
                        <p className="mt-1 text-xs text-slate-500">{t.profileText}</p>
                    </div>
                    {!editing && (
                        <button className={`${button} ml-auto`} onClick={() => setEditing(true)}>
                            <ArrowUpRight className="size-4" /> {t.edit}
                        </button>
                    )}
                </header>
                {editing ? (
                    <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submitProfile}>
                        <Field label={t.firstName} value={form.givenName} onChange={(givenName) => setForm({...form, givenName})}/>
                        <Field label={t.nickname} value={form.nickname} onChange={(nickname) => setForm({...form, nickname})}/>
                        <Field label={t.username} value={user.username} disabled/>
                        <Field label={t.email} value={user.email} disabled/>
                        <Field label={t.phone} value={form.phoneNumber} onChange={(phoneNumber) => setForm({...form, phoneNumber})}/>
                        <Field label="Avatar image URL" value={form.pictureUrl} onChange={(pictureUrl) => setForm({...form, pictureUrl})}/>
                        <div className="grid gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <span>{t.language}</span>
                            <Select value={form.locale} onValueChange={(locale) => setForm({...form, locale})}>
                                <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" aria-label={t.language}>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">{t.english}</SelectItem>
                                    <SelectItem value="km">{t.khmer}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4 sm:col-span-2 dark:border-slate-800">
                            <span className="mr-auto text-[10px] text-slate-500">{t.note}</span>
                            <button className={button} type="button" onClick={() => setEditing(false)}>{t.cancel}</button>
                            <button className="flex h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-50" type="submit" disabled={working}>
                                {working ? '…' : <>{t.save} <ArrowRight className="size-4" /></>}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Detail label={t.firstName} value={user.givenName}/>
                        <Detail label={t.lastName} value={user.familyName}/>
                        <Detail label={t.username} value={`@${user.username}`}/>
                        <Detail label={t.email} value={user.email} tag={user.emailVerified ? t.verified : null}/>
                        <Detail label={t.phone} value={user.phoneNumber}/>
                        <Detail label={t.language} value={user.locale === 'km' ? t.khmer : t.english}/>
                    </div>
                )}
            </section>

            <div className="grid gap-4 md:grid-cols-2">
                <section className={card}>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">{t.profilePhoto}</h2>
                    <p className="mt-1 text-xs text-slate-500">Set an avatar image URL in Edit profile.</p>
                    <div className="mt-4 flex items-center gap-3">
                        <Avatar user={user} className="size-14"/>
                        <button className={button} onClick={() => setEditing(true)}>Edit profile</button>
                    </div>
                </section>
                <section className={card}>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">{t.accountStatus}</h2>
                    <p className="mt-1 text-xs text-slate-500">{t.roles}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${user.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {user.enabled ? t.active : t.inactive}
                        </span>
                        {roleNames.map((role) => (
                            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700" key={role}>
                                {role}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}