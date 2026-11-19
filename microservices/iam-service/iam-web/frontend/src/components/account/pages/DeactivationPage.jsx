import {useEffect, useState} from 'react'
import {
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    ArrowLeft,
    Clock,
    Send,
    XCircle,
    UserX
} from 'lucide-react'
import {accountApi as profileApi} from '../../../features/account/api/accountApi'
import {Badge} from '../../ui/badge'
import {Button} from '../../ui/button'
import {Card} from '../../ui/card'

export default function DeactivationPage({user, locale, t = {}, onBack}) {
    const [existingRequest, setExistingRequest] = useState(null)
    const [reason, setReason] = useState('privacy')
    const [feedback, setFeedback] = useState('')
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
        {id: 'privacy', label: locale === 'km' ? 'ខ្ញុំមានការព្រួយបារម្ភអំពីភាពឯកជន ឬទិន្នន័យ' : 'I have privacy or data concerns'},
        {id: 'switch', label: locale === 'km' ? 'ខ្ញុំកំពុងប្តូរទៅគណនីផ្សេងទៀត' : 'I am switching to another account'},
        {id: 'temporary', label: locale === 'km' ? 'ខ្ញុំគ្រាន់តែចង់សម្រាកមួយរយៈ' : 'I just need a temporary break'},
        {id: 'difficult', label: locale === 'km' ? 'ប្រព័ន្ធពិបាកប្រើពេក' : 'Service is too complex to use'},
        {id: 'other', label: locale === 'km' ? 'មូលហេតុផ្សេងៗ' : 'Other reason'},
    ]

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')

        if (!reason || reason.trim() === '') {
            setError(locale === 'km' ? 'សូមជ្រើសរើសមូលហេតុចម្បងនៃការបិទគណនី' : 'Please select a reason for deactivation.')
            return
        }

        if (!acknowledged) {
            setError(
                locale === 'km'
                    ? 'សូមយល់ព្រមលើការផ្ញើសំណើទៅកាន់អ្នកគ្រប់គ្រងដើម្បីបន្ត'
                    : 'You must acknowledge the terms before submitting to administrators.'
            )
            return
        }

        setSubmitting(true)
        try {
            const req = await profileApi.requestDeactivation(user?.username || 'admin', reason, feedback)
            setExistingRequest(req)
            setMessage(
                locale === 'km'
                    ? 'សំណើបិទគណនីរបស់អ្នកត្រូវបានបញ្ជូនទៅកាន់អ្នកគ្រប់គ្រង (Admin) រួចរាល់ហើយ។ អ្នកគ្រប់គ្រងនឹងពិនិត្យសំណើនេះ។'
                    : 'Your account deactivation request has been sent to the administrator for review.'
            )
        } catch (err) {
            setError(err?.message || (locale === 'km' ? 'មិនអាចផ្ញើសំណើបានទេ។' : 'Failed to submit deactivation request.'))
        } finally {
            setSubmitting(false)
        }
    }

    async function handleCancelRequest() {
        setSubmitting(true)
        try {
            await profileApi.cancelDeactivation(user?.username || 'admin')
            setExistingRequest(null)
            setMessage(
                locale === 'km'
                    ? 'សំណើបិទគណនីត្រូវបានលុបចោលវិញហើយ។ គណនីរបស់អ្នកនៅតែបន្តដំណើរការជាធម្មតា។'
                    : 'Deactivation request cancelled. Your account remains active.'
            )
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
                    {t?.back || (locale === 'km' ? 'ត្រឡប់ទៅប្រវត្តិរូប' : 'Back to profile')}
                </Button>
            </div>

            {message && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                    <XCircle className="size-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                </div>
            )}

            {existingRequest ? (
                /* Pending deactivation view */
                <Card className="border-amber-300 bg-gradient-to-br from-amber-50/60 to-white p-6 dark:border-amber-900 dark:from-amber-950/30 dark:to-slate-900 shadow-none">
                    <div className="flex items-start gap-4">
                        <span className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                            <Clock className="size-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {locale === 'km' ? 'សំណើបិទគណនីកំពុងរង់ចាំការពិនិត្យ' : 'Account Deactivation Pending Review'}
                                </h3>
                                <Badge variant="outline" className="border-amber-400 bg-amber-100 text-amber-800 text-[10px]">
                                    {locale === 'km' ? 'បានផ្ញើទៅ Admin' : 'Sent to Admin'}
                                </Badge>
                            </div>

                            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {locale === 'km'
                                    ? `អ្នកបានដាក់សំណើសុំបិទគណនីនៅ ${existingRequest.requestedAt ? new Date(existingRequest.requestedAt).toLocaleDateString() : 'ពេលថ្មីៗ'}។ សំណើនេះត្រូវបានបញ្ជូនទៅកាន់អ្នកគ្រប់គ្រង (Admin) ដើម្បីត្រួតពិនិត្យ។`
                                    : `You submitted a deactivation request on ${existingRequest.requestedAt ? new Date(existingRequest.requestedAt).toLocaleDateString() : 'recently'}. Your request has been sent to the administrator for review.`}
                            </p>

                            {existingRequest.reason && (
                                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                                    <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-100">
                                        <UserX className="size-3.5" />
                                        <span>{locale === 'km' ? 'មូលហេតុដែលបានជ្រើសរើស៖' : 'Submitted Reason:'}</span>
                                    </div>
                                    <p className="mt-1 font-medium">
                                        {existingRequest.reason === 'privacy'
                                            ? (locale === 'km' ? 'ភាពឯកជន ឬទិន្នន័យ' : 'Privacy or data concerns')
                                            : existingRequest.reason === 'switch'
                                            ? (locale === 'km' ? 'ប្តូរទៅគណនីផ្សេងទៀត' : 'Switching to another account')
                                            : existingRequest.reason === 'temporary'
                                            ? (locale === 'km' ? 'គ្រាន់តែចង់សម្រាកមួយរយៈ' : 'Temporary break')
                                            : existingRequest.reason === 'difficult'
                                            ? (locale === 'km' ? 'ប្រព័ន្ធពិបាកប្រើពេក' : 'Service is too complex to use')
                                            : existingRequest.reason === 'other'
                                            ? (locale === 'km' ? 'មូលហេតុផ្សេងៗ' : 'Other reason')
                                            : existingRequest.reason}
                                    </p>
                                    {existingRequest.feedback && (
                                        <p className="mt-1 text-slate-600 dark:text-slate-300 italic">
                                            "{existingRequest.feedback}"
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 rounded-xl border border-amber-200 bg-white/70 p-4 text-xs dark:bg-slate-900/60 dark:border-amber-900/50">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">
                                    {locale === 'km' ? 'ផ្លាស់ប្តូរចិត្តមែនទេ?' : 'Changed your mind?'}
                                </p>
                                <p className="mt-1 text-slate-500">
                                    {locale === 'km'
                                        ? 'អ្នកអាចដកសំណើបិទគណនីវិញបានគ្រប់ពេលមុនពេល Admin អនុម័ត ហើយបន្តប្រើប្រាស់គណនីរបស់អ្នកជាធម្មតា។'
                                        : 'You can cancel this request anytime before an admin acts on it to maintain your active account.'}
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
                <Card className="p-6 shadow-none">
                    <header className="flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                        <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950">
                            <ShieldAlert className="size-6" />
                        </span>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                {t?.deactivate || (locale === 'km' ? 'ស្នើសុំបិទគណនី' : 'Request Account Deactivation')}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {locale === 'km'
                                    ? 'ផ្ញើសំណើបិទគណនីរបស់អ្នកទៅកាន់អ្នកគ្រប់គ្រង (Admin) ដើម្បីពិនិត្យ និងអនុម័ត។'
                                    : 'Submit an account deactivation request to system administrators for review.'}
                            </p>
                        </div>
                    </header>

                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                        <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                            <AlertTriangle className="size-4 text-amber-600" />
                            {locale === 'km' ? 'ដំណើរការស្នើសុំបិទគណនី' : 'Administrative Review Required'}
                        </h3>
                        <p className="mt-1.5 text-xs text-amber-800/90 dark:text-amber-300 leading-relaxed">
                            {locale === 'km'
                                ? 'សំណើរបស់អ្នកនឹងត្រូវបញ្ជូនទៅកាន់អ្នកគ្រប់គ្រង (Admin) ដើម្បីពិនិត្យ។ អ្នកគ្រាន់តែជ្រើសរើសមូលហេតុខាងក្រោម ដោយមិនចាំបាច់បញ្ចូលពាក្យសម្ងាត់ទេ។ នៅពេល Admin អនុម័ត សម័យដែលកំពុងដំណើរការនឹងត្រូវបញ្ចប់។'
                                : 'Your request will be submitted to administrators for review. Simply choose a reason below — no password is required. Once approved by an administrator, your active sessions will end.'}
                        </p>
                    </div>

                    <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-xs font-bold text-slate-800 dark:text-white block mb-2">
                                {locale === 'km' ? 'សូមជ្រើសរើសមូលហេតុចម្បង (តម្រូវ):' : 'Select a reason for deactivation (required):'}
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
                                            required
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

                        <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                                className="mt-0.5 accent-violet-700"
                            />
                            <span className="leading-5">
                                {locale === 'km'
                                    ? 'ខ្ញុំយល់ព្រមថាសំណើនេះនឹងត្រូវបញ្ជូនទៅកាន់អ្នកគ្រប់គ្រង (Admin) ដើម្បីពិនិត្យ និងអនុម័ត មុនពេលគណនីត្រូវបានបិទ។'
                                    : 'I understand that this request will be sent to administrators for review and approval before my account is deactivated.'}
                            </span>
                        </label>

                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                            <Button type="button" variant="outline" size="sm" onClick={onBack}>
                                {t?.cancel || (locale === 'km' ? 'បោះបង់' : 'Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                size="sm"
                                disabled={submitting || !reason || !acknowledged}
                                className="gap-1.5 font-semibold bg-violet-700 hover:bg-violet-800 text-white"
                            >
                                <Send className="size-3.5" />
                                {submitting
                                    ? (locale === 'km' ? 'កំពុងផ្ញើ...' : 'Submitting…')
                                    : (locale === 'km' ? 'ផ្ញើសំណើទៅកាន់ Admin' : 'Send Request to Admin')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    )
}
