import { useNavigate, useParams } from 'react-router-dom';
import AdminUserDetailPage from '../../features/admin/pages/AdminUserDetailPage';
import { useAuth } from '../../auth/AuthContext';

export default function UserDetail() {
    const { id } = useParams();
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    if (!id || id === 'undefined') {
        return (
            <div className="p-6 max-w-xl">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    <p className="font-bold text-sm mb-1">{locale === 'km' ? 'រកមិនឃើញអ្នកប្រើប្រាស់' : 'User not found'}</p>
                    <p>{locale === 'km' ? 'អត្តសញ្ញាណអ្នកប្រើប្រាស់មិនត្រឹមត្រូវ ឬត្រូវបានបាត់បង់។' : 'The requested user identifier is missing or invalid.'}</p>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/users', { replace: true })}
                        className="mt-4 rounded-lg bg-amber-800 px-3 py-1.5 font-semibold text-white hover:bg-amber-900 dark:bg-amber-700"
                    >
                        {locale === 'km' ? 'ត្រឡប់ទៅបញ្ជីអ្នកប្រើប្រាស់' : 'Back to users'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AdminUserDetailPage
            userId={id}
            token={token}
            locale={locale}
            t={t}
            onBack={() => navigate('/admin/users')}
        />
    );
}
