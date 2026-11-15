import {useEffect, useState} from 'react'
import {
    Activity,
    KeyRound,
    UserCheck,
    Link2,
    ShieldAlert,
    SlidersHorizontal,
    Clock,
    Globe,
    RefreshCw
} from 'lucide-react'
import {profileApi} from '../../features/profile/api/profileApi'
import {Badge} from '../ui/badge'
import {Button} from '../ui/button'
import {Card} from '../ui/card'

function getActivityIcon(type) {
    switch (type) {
        case 'PASSWORD':
            return KeyRound
        case 'PROFILE':
            return UserCheck
        case 'IDENTITY':
            return Link2
        case 'SESSION':
            return SlidersHorizontal
        case 'SECURITY_ALERT':
        case 'ACCOUNT_DEACTIVATION':
            return ShieldAlert
        default:
            return Activity
    }
}

function getSeverityBadge(severity, locale) {
    switch (severity) {
        case 'success':
            return <Badge variant="success">{locale === 'km' ? 'ជោគជ័យ' : 'Success'}</Badge>
        case 'warning':
            return (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950">
                    {locale === 'km' ? 'ការព្រមាន' : 'Warning'}
                </Badge>
            )
        case 'danger':
            return <Badge variant="destructive">{locale === 'km' ? 'គ្រោះថ្នាក់' : 'Critical'}</Badge>
        default:
            return <Badge variant="secondary">{locale === 'km' ? 'ព័ត៌មាន' : 'Info'}</Badge>
    }
}

function formatDateTime(dateString, locale) {
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return typeof dateString === 'string' ? dateString : '—'
    try {
        return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(d)
    } catch {
        return String(dateString)
    }
}

export default function AccountActivityPage({user, locale, t}) {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('ALL')

    async function loadActivities() {
        setLoading(true)
        try {
            const data = await profileApi.getAccountActivity()
            setActivities(data)
        } catch {
            console.error('Failed to load account activity')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadActivities()
    }, [])

    const filtered = activities.filter((act) => {
        if (filterType === 'ALL') return true
        return act.type === filterType
    })

    const filterTypes = [
        {id: 'ALL', label: locale === 'km' ? 'ទាំងអស់' : 'All'},
        {id: 'PASSWORD', label: locale === 'km' ? 'ពាក្យសម្ងាត់' : 'Password'},
        {id: 'PROFILE', label: locale === 'km' ? 'ប្រវត្តិរូប' : 'Profile'},
        {id: 'IDENTITY', label: locale === 'km' ? 'គណនីភ្ជាប់' : 'Identities'},
        {id: 'SESSION', label: locale === 'km' ? 'សម័យ' : 'Sessions'},
    ]

    return (
        <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {t.activity || 'Account Activity'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {t.activityDesc || 'A chronological timeline of security-related changes made to your account.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadActivities} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t.refresh || 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
                {filterTypes.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterType(tab.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            filterType === tab.id
                                ? 'bg-violet-700 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <Card className="p-5">
                <div className="relative pl-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 space-y-6">
                    {filtered.map((item) => {
                        const Icon = getActivityIcon(item.type)
                        return (
                            <div key={item.id} className="relative group">
                                <span className="absolute -left-6 mt-1 flex size-6 items-center justify-center rounded-full bg-violet-100 text-violet-700 ring-4 ring-white dark:bg-violet-950 dark:text-violet-300 dark:ring-slate-900">
                                    <Icon className="size-3.5" />
                                </span>

                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/40">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {item.title}
                                            </h3>
                                            {getSeverityBadge(item.severity, locale)}
                                        </div>
                                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                            <Clock className="size-3" />
                                            {formatDateTime(item.timestamp, locale)}
                                        </span>
                                    </div>

                                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                                        {item.description}
                                    </p>

                                    {item.ipAddress && (
                                        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                            <Globe className="size-3 text-slate-400" />
                                            <span>IP: {item.ipAddress}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {filtered.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-400">
                            {locale === 'km' ? 'មិនមានសកម្មភាពគណនីទេ' : 'No account activities recorded.'}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
