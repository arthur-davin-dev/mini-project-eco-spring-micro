import {useEffect, useState} from 'react'
import {
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    ArrowLeft,
    Clock,
    Lock,
    Send,
    XCircle
} from 'lucide-react'
import {profileApi} from '../../features/profile/api/profileApi'
import {Badge} from '../ui/badge'
import {Button} from '../ui/button'
import {Card} from '../ui/card'
import {Input} from '../ui/input'

export default function DeactivationPage({user, locale, t, onBack}) {
    const [existingRequest, setExistingRequest] = useState(null)
    const [reason, setReason] = useState('privacy')
    const [feedback, setFeedback] = useState('')
    const [password, setPassword] = useState('')
    const [acknowledged, setAcknowledged] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    async function checkStatus() {
        try {
            const req = await profileApi.getDeactivationRequest(user?.username || 'admin')
            setExistingRequest(req)
        } catch (e) {
            console.error('Failed to check deactivation status:', e)
        }
    }

    useEffect(() => {
        checkStatus()
    }, [user])

    const reasons = [
        {id: 'privacy', label: locale === 'km' ? 'ខ្ញុំមានការព្រួយបារម្ភអំពីភាពឯកជន' : 'I have privacy or data concerns'},
        {id: 'switch', label: locale === 'km' ? 'ខ្ញុំកំពុងប្តូរទៅគណនីផ្សេងទៀត' : 'I am switching to another account'},
        {id: 'temporary', label: locale === 'km' ? 'ខ្ញុំគ្រាន់តែចង់សម្រាកមួយរយៈ' : 'I just need a temporary break'},
        {id: 'difficult', label: locale === 'km' ? 'ប្រព័ន្ធពិបាកប្រើពេក' : 'Service is too complex to use'},
        {id: 'other', label: locale === 'km' ? 'មូលហេតុផ្សេងៗ' : 'Other reason'},
    ]

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')

        if (!password) {
            setError(locale === 'km' ? 'សូមបញ្ចូលពាក្យសម្ងាត់របស់អ្នកដើម្បីបញ្ជាក់' : 'Please enter your password to confirm identity.')
            return
        }

        if (!acknowledged) {
            setError(locale === 'km' ? 'សូមយល់ព្រមលើលក្ខខណ្ឌនៃការបិទគណនី' : 'You must acknowledge the terms to proceed.')
            return
        }

        setSubmitting(true)
        try {
            const req = await profileApi.requestDeactivation(user?.username || 'admin', reason, feedback)
            setExistingRequest(req)
            setMessage(
                locale === 'km'
                    ? 'សំណើបិទគណនីត្រូវបានផ្ញើដោយជោគជ័យ។ អ្នកមានរយៈពេល 30 ថ្ងៃក្នុងការបដិសេធវិញ។'
                    : 'Account deactivation requested. You have a 30-day grace period to withdraw this request.'
            )
        } catch {
            setError(locale === 'km' ? 'មិនអាចផ្ញើសំណើបានទេ។' : 'Failed to submit deactivation request.')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleCancelRequest() {
        setSubmitting(true)
        try {
            await profileApi.cancelDeactivation(user?.username || 'admin')
            setExistingRequest(null)
            setMessage(locale === 'km' ? 'សំណើបិទគណនីត្រូវបានលុបចោលវិញហើយ។' : 'Deactivation request cancelled. Your account remains active.')
        } catch {
            setError(locale === 'km' ? 'បរាជ័យក្នុងការលុបចោលសំណើ' : 'Failed to cancel deactivation request.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="grid max-w-3xl gap-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 text-slate-500">
                    <ArrowLeft className="size-4 mr-1.5" />
                    {t.back || 'Back to profile'}
                </Button>
            </div>

            {message && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                    <XCircle className="size-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {existingRequest ? (
                /* Pending deactivation view */
                <Card className="border-amber-300 bg-gradient-to-br from-amber-50/60 to-white p-6 dark:border-amber-900 dark:from-amber-950/30 dark:to-slate-900">
                    <div className="flex items-start gap-4">
                        <span className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                            <Clock className="size-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {locale === 'km' ? 'សំណើបិទគណនីកំពុងរង់ចាំ' : 'Account Deactivation Pending'}
                                </h3>
                                <Badge variant="outline" className="border-amber-400 bg-amber-100 text-amber-800 text-[10px]">
                                    {locale === 'km' ? 'កំពុងដំណើរការ' : 'Pending Review'}
                                </Badge>
                            </div>

                            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {locale === 'km'
                                    ? `អ្នកបានស្នើសុំបិទគណនីនៅ ${new Date(existingRequest.requestedAt).toLocaleDateString()}។ គណនីរបស់អ្នកនឹងត្រូវលុបជាអចិន្ត្រៃយ៍នៅថ្ងៃ ${new Date(existingRequest.gracePeriodEndsAt).toLocaleDateString()} (រយៈពេលអនុគ្រោះ 30 ថ្ងៃ)។`
                                    : `You submitted a deactivation request on ${new Date(existingRequest.requestedAt).toLocaleDateString()}. Your account is in a 30-day grace period until ${new Date(existingRequest.gracePeriodEndsAt).toLocaleDateString()}, after which it will be permanently removed.`}
                            </p>

                            <div className="mt-4 rounded-xl border border-amber-200 bg-white/70 p-4 text-xs dark:bg-slate-900/60 dark:border-amber-900/50">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">
                                    {locale === 'km' ? 'ផ្លាស់ប្តូរចិត្តមែនទេ?' : 'Changed your mind?'}
                                </p>
                                <p className="mt-1 text-slate-500">
                                    {locale === 'km'
                                        ? 'អ្នកអាចដកសំណើបិទគណនីវិញបានគ្រប់ពេលមុនកាលកំណត់ ហើយបន្តប្រើប្រាស់គណនីរបស់អ្នកជាធម្មតា។'
                                        : 'You can cancel this request anytime before the grace period ends to maintain full access.'}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={submitting}
                                    onClick={handleCancelRequest}
                                    className="mt-3 border-amber-400 text-amber-800 hover:bg-amber-100 text-xs font-semibold"
                                >
                                    {locale === 'km' ? 'ដកសំណើបិទគណនីវិញ' : 'Cancel Deactivation Request'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                /* New request wizard */
                <Card className="p-6">
                    <header className="flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                        <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950">
                            <ShieldAlert className="size-6" />
                        </span>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                {t.deactivate || 'Request Account Deactivation'}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {t.deactivateDesc || 'Initiate an administrative deactivation of your IAM identity account.'}
                            </p>
                        </div>
                    </header>

                    <div className="mt-6 rounded-xl border border-red-100 bg-red-50/60 p-4 dark:border-red-950 dark:bg-red-950/20">
                        <h3 className="text-xs font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                            <AlertTriangle className="size-4 text-red-600" />
                            {t.dangerTitle || 'This action affects your access and credentials'}
                        </h3>
                        <p className="mt-1.5 text-xs text-red-800/80 dark:text-red-300 leading-relaxed">
                            {locale === 'km'
                                ? 'នៅពេលស្នើសុំបិទគណនី សម័យដែលកំពុងដំណើរការទាំងអស់នឹងត្រូវបញ្ចប់ សិទ្ធិចូលប្រើប្រាស់ប្រព័ន្ធ microservices នឹងត្រូវបានផ្អាក ហើយគណនីរបស់អ្នកនឹងចូលទៅក្នុងរយៈពេលអនុគ្រោះ 30 ថ្ងៃ។'
                                : 'Deactivating your account will revoke active sessions, suspend access to connected microservices, and schedule your profile for deletion after a 30-day grace period.'}
                        </p>
                    </div>

                    <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-xs font-bold text-slate-800 dark:text-white block mb-2">
                                {locale === 'km' ? 'សូមជ្រើសរើសមូលហេតុចម្បង:' : 'Why are you leaving?'}
                            </label>
                            <div className="grid gap-2">
                                {reasons.map((r) => (
                                    <label
                                        key={r.id}
                                        className={`flex items-center gap-3 rounded-lg border p-3 text-xs cursor-pointer transition ${
                                            reason === r.id
                                                ? 'border-violet-600 bg-violet-50/40 font-semibold text-violet-900 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-200'
                                                : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="deactivationReason"
                                            value={r.id}
                                            checked={reason === r.id}
                                            onChange={() => setReason(r.id)}
                                            className="accent-violet-700"
                                        />
                                        <span>{r.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-800 dark:text-white block mb-1.5">
                                {locale === 'km' ? 'មតិយោបល់បន្ថែម (មិនបង្ខំ):' : 'Additional comments (optional):'}
                            </label>
                            <textarea
                                rows={3}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder={locale === 'km' ? 'តើមានអ្វីដែលយើងអាចកែលម្អបានទេ?...' : 'How could we have improved your experience?…'}
                                className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:border-violet-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-800 dark:text-white block mb-1.5 flex items-center gap-1.5">
                                <Lock className="size-3.5 text-slate-400" />
                                {locale === 'km' ? 'បញ្ជាក់ពាក្យសម្ងាត់របស់អ្នក:' : 'Confirm your current password:'}
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="text-xs"
                                required
                            />
                        </div>

                        <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                                className="mt-0.5 accent-red-600"
                            />
                            <span className="leading-5">
                                {locale === 'km'
                                    ? 'ខ្ញុំយល់ច្បាស់ថាគណនីរបស់ខ្ញុំនឹងត្រូវផ្អាកភ្លាមៗ ហើយខ្ញុំមានរយៈពេល 30 ថ្ងៃដើម្បីដកសំណើនេះវិញ មុនពេលទិន្នន័យត្រូវបានលុបជាស្ថាពរ។'
                                    : 'I understand that submitting this request will immediately suspend my account and that I have 30 days to withdraw before permanent deletion.'}
                            </span>
                        </label>

                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                            <Button type="button" variant="outline" size="sm" onClick={onBack}>
                                {t.cancel || 'Cancel'}
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                                disabled={submitting || !acknowledged}
                                className="gap-1.5 font-semibold"
                            >
                                <Send className="size-3.5" />
                                {submitting ? (locale === 'km' ? 'កំពុងផ្ញើ...' : 'Submitting…') : (t.request || 'Submit Request')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    )
}
