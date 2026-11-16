import {useEffect, useState} from 'react'
import {
    User,
    Shield,
    Link as LinkIcon,
    MonitorSmartphone,
    ArrowUpRight,
    ArrowRight,
    Check,
    Camera,
    Sparkles,
    Image as ImageIcon
} from 'lucide-react'
import Detail from '../common/Detail'
import Field from '../common/Field'
import {formatMemberDate} from '../../utils/accountFormat'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select'
import Avatar from '../common/Avatar'
import {Badge} from '../ui/badge'

const card = 'rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'
const button = 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

export const PRESET_AVATARS = [
    'https://i.pinimg.com/736x/57/a9/7d/57a97ddfd303d50b8678930f2897fc4e.jpg',
    'https://i.pinimg.com/1200x/02/1b/97/021b970e3a3e67fe6f64f7990bdaae54.jpg',
    'https://i.pinimg.com/736x/ca/42/a6/ca42a68b337b748a69e4d544274cc725.jpg',
    'https://i.pinimg.com/736x/bd/fd/65/bdfd65c5448bd74e153447fd11135911.jpg',
    'https://i.pinimg.com/1200x/ee/92/37/ee92375cdfdad6f01d885eecca5295a3.jpg',
]

export default function ProfilePage({user, identities, roleNames, locale, t, working, onSave, setPage}) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})

    useEffect(() => {
        setForm({
            givenName: user.givenName || '',
            familyName: user.familyName || '',
            nickname: user.nickname || '',
            phoneNumber: user.phoneNumber || '',
            pictureUrl: user.pictureUrl || '',
            locale: user.locale || locale,
        })
    }, [user, locale])

    async function submitProfile(event) {
        event.preventDefault()
        if (await onSave(form)) setEditing(false)
    }

    const fullName = user.name || [user.givenName, user.familyName].filter(Boolean).join(' ') || user.username

    return (
        <div className="grid gap-5">
            {/* Header banner */}
            <section className="flex flex-wrap items-center gap-4 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-white p-5 dark:border-violet-950 dark:from-violet-950/50 dark:to-slate-900">
                <Avatar user={{...user, pictureUrl: form.pictureUrl || user.pictureUrl}} className="size-16 bg-violet-200 text-xl ring-2 ring-violet-400" />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                        {fullName}
                        <Badge variant={user.enabled ? 'success' : 'secondary'}>
                            {user.enabled ? (t.active || 'Active') : (t.inactive || 'Inactive')}
                        </Badge>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                        @{user.username} <span className="px-1">·</span> {user.email}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-700 shadow-xs dark:bg-slate-800 dark:text-emerald-300">
                            <Check className="size-3" strokeWidth={3} />
                            {user.emailVerified ? (t.verified || 'Verified') : 'Email'}
                        </span>
                        {roleNames.slice(0, 3).map((role) => (
                            <span
                                className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-semibold text-violet-800 dark:bg-violet-900 dark:text-violet-200"
                                key={role}
                            >
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                    <small className="block">{t.memberSince || 'Member since'}</small>
                    <b className="mt-1 block text-slate-700 dark:text-slate-200">{formatMemberDate(user.createdAt, locale)}</b>
                </div>
            </section>

            {/* Quick overview metric cards */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    [t.overviewCards?.[0] || 'Profile details', user.phoneNumber ? 'Completed' : 'Add phone', <User className="size-5" key="profile" />, 'profile'],
                    [t.overviewCards?.[1] || 'Security', 'Password protected', <Shield className="size-5" key="security" />, 'security'],
                    [t.overviewCards?.[2] || 'Linked accounts', `${identities?.length || 0} connected`, <LinkIcon className="size-5" key="linked" />, 'linked'],
                    [t.overviewCards?.[3] || 'Active sessions', 'Manage devices', <MonitorSmartphone className="size-5" key="sessions" />, 'sessions'],
                ].map(([label, value, icon, targetPage]) => (
                    <button
                        className={`${card} flex min-h-18 items-center gap-3 p-3.5 text-left transition hover:border-violet-300 cursor-pointer`}
                        key={label}
                        onClick={() => setPage(targetPage)}
                    >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            {icon}
                        </span>
                        <span className="grid min-w-0 gap-0.5">
                            <small className="truncate text-[10px] text-slate-500">{label}</small>
                            <b className="truncate text-xs text-slate-800 dark:text-white">{value}</b>
                        </span>
                        <ArrowUpRight className="ml-auto size-4 text-slate-400" />
                    </button>
                ))}
            </section>

            {/* Profile Information View / Edit */}
            <section className={card}>
                <header className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            <User className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-sm font-medium text-slate-800 dark:text-white">{t.profile || 'Personal Information'}</h2>
                            <p className="mt-0.5 text-xs text-slate-500">{t.profileText || 'Manage the details connected to your identity.'}</p>
                        </div>
                    </div>
                    {!editing && (
                        <button className={button} onClick={() => setEditing(true)}>
                            <ArrowUpRight className="size-4" /> {t.edit || 'Edit profile'}
                        </button>
                    )}
                </header>

                {editing ? (
                    <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submitProfile}>
                        <Field
                            label={t.firstName || 'First name'}
                            value={form.givenName}
                            onChange={(givenName) => setForm({...form, givenName})}
                        />
                        <Field
                            label={t.lastName || 'Last name'}
                            value={form.familyName}
                            onChange={(familyName) => setForm({...form, familyName})}
                        />
                        <Field
                            label={t.nickname || 'Display name / Nickname'}
                            value={form.nickname}
                            onChange={(nickname) => setForm({...form, nickname})}
                        />
                        <Field
                            label={t.username || 'Username'}
                            value={user.username}
                            disabled
                        />
                        <Field
                            label={t.email || 'Email address'}
                            value={user.email}
                            disabled
                        />
                        <Field
                            label={t.phone || 'Phone number'}
                            value={form.phoneNumber}
                            placeholder="+855 12 345 678"
                            onChange={(phoneNumber) => setForm({...form, phoneNumber})}
                        />

                        {/* Profile Picture Input & Presets */}
                        <div className="sm:col-span-2 grid gap-2">
                            <Field
                                label="Profile picture URL"
                                value={form.pictureUrl}
                                placeholder="https://example.com/avatar.jpg"
                                onChange={(pictureUrl) => setForm({...form, pictureUrl})}
                            />
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[11px] text-slate-400">Quick avatars:</span>
                                {PRESET_AVATARS.map((preset, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => setForm({...form, pictureUrl: preset})}
                                        className={`size-8 rounded-full overflow-hidden border-2 transition ${
                                            form.pictureUrl === preset ? 'border-violet-600 ring-2 ring-violet-200' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={preset} alt="preset" className="size-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <span>{t.language || 'Language'}</span>
                            <Select value={form.locale} onValueChange={(nextLocale) => setForm({...form, locale: nextLocale})}>
                                <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">{t.english || 'English'}</SelectItem>
                                    <SelectItem value="km">{t.khmer || 'Khmer (ខ្មែរ)'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4 sm:col-span-2 dark:border-slate-800">
                            <span className="mr-auto text-[10px] text-slate-500">{t.note || 'Changes are saved to your IAM account profile.'}</span>
                            <button className={button} type="button" onClick={() => setEditing(false)}>
                                {t.cancel || 'Cancel'}
                            </button>
                            <button
                                className="flex h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
                                type="submit"
                                disabled={working}
                            >
                                {working ? '…' : <>{t.save || 'Save changes'} <ArrowRight className="size-4" /></>}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Detail label={t.firstName || 'First name'} value={user.givenName} />
                        <Detail label={t.lastName || 'Last name'} value={user.familyName} />
                        <Detail label={t.nickname || 'Nickname / Display'} value={user.nickname} />
                        <Detail label={t.username || 'Username'} value={`@${user.username}`} />
                        <Detail label={t.email || 'Email'} value={user.email} tag={user.emailVerified ? (t.verified || 'Verified') : null} />
                        <Detail label={t.phone || 'Phone number'} value={user.phoneNumber || '—'} />
                        <Detail label={t.language || 'Language'} value={user.locale === 'km' ? (t.khmer || 'Khmer') : (t.english || 'English')} />
                        <Detail label={t.memberSince || 'Registered on'} value={formatMemberDate(user.createdAt, locale)} />
                    </div>
                )}
            </section>

            {/* Avatar & Account Status widgets */}
            <div className="grid gap-4 md:grid-cols-2">
                <section className={card}>
                    <h2 className="text-sm font-medium text-slate-800 dark:text-white">{t.profilePhoto || 'Profile picture'}</h2>
                    <p className="mt-1 text-xs text-slate-500">Your avatar represents you across IAM clients and connected services.</p>
                    <div className="mt-4 flex items-center gap-4">
                        <Avatar user={user} className="size-16 text-lg ring-2 ring-violet-200" />
                        <div>
                            <button className={button} onClick={() => setEditing(true)}>
                                <Camera className="size-3.5 mr-1" />
                                {t.choosePhoto || 'Change photo'}
                            </button>
                            <p className="mt-1 text-xs text-slate-400">Supports HTTPS image URLs & presets</p>
                        </div>
                    </div>
                </section>

                <section className={card}>
                    <h2 className="text-sm font-medium text-slate-800 dark:text-white">{t.accountStatus || 'Account status'}</h2>
                    <p className="mt-1 text-xs text-slate-500">{t.roles || 'Assigned roles'}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge variant={user.enabled ? 'success' : 'secondary'} className="px-3 py-1">
                            {user.enabled ? (t.active || 'Active') : (t.inactive || 'Inactive')}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                            {user.accountNonLocked ? 'Account Unlocked' : 'Locked'}
                        </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {roleNames.map((r) => (
                            <span key={r} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {r}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
