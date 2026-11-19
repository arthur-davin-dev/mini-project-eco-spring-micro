import { useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CALLBACK_PATH } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { accountApi } from '../features/account/api/accountApi';
import { useTheme } from './providers';
import AccountLoadingSkeleton from '../components/account/ui/AccountLoadingSkeleton';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Auth Pages
import LoginPage from '../components/auth/pages/LoginPage';
import RegisterPage from '../components/auth/pages/RegisterPage';
import ConsentPage from '../components/auth/pages/ConsentPage';
import CallbackPage from '../components/auth/pages/CallbackPage';
import ForgotPasswordPage from '../components/auth/pages/ForgotPasswordPage';
import ExpiredPasswordPage from '../components/auth/pages/ExpiredPasswordPage';

// Account Pages
import ProfilePage from '../components/account/pages/ProfilePage';
import PasswordPage from '../components/account/pages/PasswordPage';
import LinkedAccountsPage from '../components/account/pages/LinkedAccountsPage';
import SessionsPage from '../components/account/pages/SessionsPage';
import SessionManagementPage from '../components/account/pages/SessionManagementPage';
import LoginHistoryPage from '../components/account/pages/LoginHistoryPage';
import AccountActivityPage from '../components/account/pages/AccountActivityPage';
import DeactivationPage from '../components/account/pages/DeactivationPage';

// Admin Pages
import AdminOverviewPage from '../components/admin/pages/AdminOverviewPage';
import AdminUsersPage from '../components/admin/pages/AdminUsersPage';
import AdminUserDetailPage from '../components/admin/pages/AdminUserDetailPage';
import AdminUserSessionsPage from '../components/admin/pages/AdminUserSessionsPage';
import AdminUserLoginHistoryPage from '../components/admin/pages/AdminUserLoginHistoryPage';
import AdminRolesPage from '../components/admin/pages/AdminRolesPage';
import AdminPermissionsPage from '../components/admin/pages/AdminPermissionsPage';
import AdminClientsPage from '../components/admin/pages/AdminClientsPage';
import AdminAuditLogsPage from '../components/admin/pages/AdminAuditLogsPage';
import AdminSecurityManagementPage from '../components/admin/pages/AdminSecurityManagementPage';
import AdminSystemConfigPage from '../components/admin/pages/AdminSystemConfigPage';

import { useI18n } from '../i18n';

export const userPermissions = ['user:read', 'user:create', 'user:update', 'user:delete', 'user:assign'];
export const rolePermissions = ['role:read', 'role:create', 'role:update', 'role:delete', 'role:assign'];
export const permissionPermissions = ['permission:read', 'permission:create', 'permission:update', 'permission:delete'];
export const clientPermissions = ['user:read', 'user:create', 'user:update', 'user:delete'];

export function RequireAuth() {
    const { user, loading, t } = useAuth();
    const location = useLocation();

    if (loading && !user) {
        return <AccountLoadingSkeleton label={t?.loading || 'Loading...'} />;
    }

    if (!user) {
        const returnTo = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
    }

    return <Outlet />;
}

export function RequireAuthority({ any = [], children }) {
    const { can, user, loading, t } = useAuth();

    if (loading && !user) {
        return <AccountLoadingSkeleton label={t?.loading || 'Loading...'} />;
    }

    const authorities = Array.isArray(any) ? any : [any];
    if (!can(...authorities)) {
        return <Navigate to="/account/profile" replace />;
    }

    return children ? children : <Outlet />;
}

export const guard = (any, element) => <RequireAuthority any={any}>{element}</RequireAuthority>;

function Home() {
    const { can } = useAuth();
    const canManage = can(
        'ROLE_ADMIN', 'ADMIN',
        ...userPermissions,
        ...rolePermissions,
        ...permissionPermissions
    );
    return <Navigate to={canManage ? '/admin' : '/account/profile'} replace />;
}

function LegacyRedirect({ to }) {
    const location = useLocation();
    return <Navigate to={to + location.search} replace />;
}

function NotFound() {
    const { t } = useI18n();
    return (
        <div className="empty flex min-h-[400px] flex-col items-center justify-center text-center p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                {t('notfound.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t('notfound.body')}
            </p>
        </div>
    );
}

// Wrapper for Profile route
function ProfileRoute() {
    const { user, identities, roleNames, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <ProfilePage
            user={user}
            identities={identities}
            roleNames={roleNames}
            locale={locale}
            t={t}
            setPage={(page) => {
                if (page === 'deactivate') navigate('/account/deactivate');
                else navigate('/account/' + page);
            }}
        />
    );
}

// Wrapper for Sessions route
function SessionsRoute() {
    const { user, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <SessionsPage
            user={user}
            locale={locale}
            t={t}
            setPage={(page) => {
                if (page === 'sessionManagement') navigate('/account/session-management');
                else navigate('/account/' + page);
            }}
        />
    );
}

// Wrapper for Session Management route
function SessionManagementRoute() {
    const { user, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <SessionManagementPage
            user={user}
            locale={locale}
            t={t}
            setPage={(page) => {
                if (page === 'sessions') navigate('/account/sessions');
                else navigate('/account/' + page);
            }}
        />
    );
}

// Wrapper for LinkedAccounts route
function LinkedAccountsRoute() {
    const { token, identities, loadAccount, t } = useAuth();
    const [working, setWorking] = useState(false);

    const handleUnlink = async (identity) => {
        const providerName = identity?.provider || 'this provider';
        if (!window.confirm(`Unlink ${providerName}?`)) return;
        setWorking(true);
        try {
            await accountApi.unlinkAccount(token, identity?.uuid || identity?.id);
            if (loadAccount) await loadAccount(token);
        } catch (err) {
            alert(err?.message || 'Failed to unlink account');
        } finally {
            setWorking(false);
        }
    };

    const handleLink = (_e, provider) => {
        accountApi.linkAccount(token, provider);
    };

    return (
        <LinkedAccountsPage
            identities={identities}
            working={working}
            t={t}
            onUnlink={handleUnlink}
            onLink={handleLink}
        />
    );
}

// Wrapper for LoginHistory route
function LoginHistoryRoute() {
    const { user, locale, t } = useAuth();
    return <LoginHistoryPage user={user} locale={locale} t={t} />;
}

// Wrapper for AccountActivity route
function AccountActivityRoute() {
    const { user, locale, t } = useAuth();
    return <AccountActivityPage user={user} locale={locale} t={t} />;
}

// Wrapper for Deactivate route
function DeactivateRoute() {
    const { user, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <DeactivationPage
            user={user}
            locale={locale}
            t={t}
            onBack={() => navigate('/account/profile')}
        />
    );
}

// Wrapper for Overview route
function OverviewRoute() {
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminOverviewPage
            token={token}
            locale={locale}
            t={t}
            setPage={(page) => {
                if (page === 'users') navigate('/admin/users');
                else if (page === 'roles') navigate('/admin/roles');
                else if (page === 'permissions') navigate('/admin/permissions');
                else if (page === 'clients') navigate('/admin/clients');
                else if (page === 'securityManagement' || page === 'security') navigate('/admin/security');
                else if (page === 'auditLogs' || page === 'audit') navigate('/admin/audit-logs');
                else if (page === 'systemConfig' || page === 'system') navigate('/admin/system-config');
                else navigate('/admin/' + page);
            }}
            onSelectUser={(user) => {
                const id = typeof user === 'string' ? user : (user?.uuid || user?.id);
                if (id && id !== 'undefined') navigate(`/admin/users/${id}`);
            }}
        />
    );
}

// Wrapper for UserList route
function UserListRoute() {
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminUsersPage
            token={token}
            locale={locale}
            t={t}
            onSelectUser={(user) => {
                const id = typeof user === 'string' ? user : (user?.uuid || user?.id);
                if (id && id !== 'undefined') navigate(`/admin/users/${id}`);
            }}
        />
    );
}

// Wrapper for UserDetail route
function UserDetailRoute() {
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

// Wrapper for RoleList route
function RoleListRoute() {
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminRolesPage
            token={token}
            locale={locale}
            t={t}
            onSelectRole={(role) => {
                const id = typeof role === 'string' ? role : (role?.uuid || role?.id);
                if (id && id !== 'undefined') navigate(`/admin/roles/${id}`);
            }}
        />
    );
}

// Wrapper for RoleDetail route
function RoleDetailRoute() {
    const { id } = useParams();
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminRolesPage
            token={token}
            locale={locale}
            t={t}
            selectedRoleId={id}
            onBack={() => navigate('/admin/roles')}
        />
    );
}

// Wrapper for ClientList route
function ClientListRoute() {
    const { locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminClientsPage
            locale={locale}
            t={t}
            onSelectClient={(client) => {
                const id = typeof client === 'string' ? client : (client?.clientId || client?.id);
                if (id && id !== 'undefined') navigate(`/admin/clients/${id}`);
            }}
        />
    );
}

// Wrapper for ClientDetail route
function ClientDetailRoute() {
    const { id } = useParams();
    const { locale, t } = useAuth();

    return (
        <AdminClientsPage
            initialClientId={id}
            locale={locale}
            t={t}
        />
    );
}

// Wrapper for Security Management route
function SecurityManagementRoute() {
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminSecurityManagementPage
            token={token}
            locale={locale}
            t={t}
            onSelectUser={(user) => {
                const id = typeof user === 'string' ? user : (user?.uuid || user?.id);
                if (id && id !== 'undefined') navigate(`/admin/users/${id}`);
            }}
        />
    );
}

// Wrapper for AdminPermissions route
function AdminPermissionsRoute() {
    const { token, locale, t } = useAuth();
    return <AdminPermissionsPage token={token} locale={locale} t={t} />;
}

// Wrapper for AdminUserSessions route
function AdminUserSessionsRoute() {
    const { token, locale, t } = useAuth();
    return <AdminUserSessionsPage token={token} locale={locale} t={t} />;
}

// Wrapper for AdminUserLoginHistory route
function AdminUserLoginHistoryRoute() {
    const { token, locale, t } = useAuth();
    return <AdminUserLoginHistoryPage token={token} locale={locale} t={t} />;
}

// Wrapper for AdminAuditLogs route
function AdminAuditLogsRoute() {
    const { token, locale, t } = useAuth();
    return <AdminAuditLogsPage token={token} locale={locale} t={t} />;
}

// Wrapper for AdminSystemConfig route
function AdminSystemConfigRoute() {
    const { token, locale, t } = useAuth();
    return <AdminSystemConfigPage token={token} locale={locale} t={t} />;
}

export function AppRouter() {
    const { dark, setDark } = useTheme();

    return (
        <Routes>
            {/* Public auth & OAuth2 routes */}
            <Route path="/login" element={<LoginPage dark={dark} setDark={setDark} />} />
            <Route path="/register" element={<RegisterPage dark={dark} setDark={setDark} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage dark={dark} setDark={setDark} />} />
            <Route path="/reset-password" element={<ForgotPasswordPage dark={dark} setDark={setDark} />} />
            <Route path="/expired-password" element={<ExpiredPasswordPage dark={dark} setDark={setDark} />} />
            <Route path="/oauth2/consent" element={<ConsentPage dark={dark} setDark={setDark} />} />
            <Route path={CALLBACK_PATH} element={<CallbackPage />} />
            <Route path="/callback" element={<CallbackPage />} />

            {/* Legacy redirects */}
            <Route path="/profile" element={<LegacyRedirect to="/account/profile" />} />
            <Route path="/profile/edit" element={<LegacyRedirect to="/account/profile" />} />
            <Route path="/profile/password" element={<LegacyRedirect to="/account/password" />} />
            <Route path="/profile/security" element={<LegacyRedirect to="/account/password" />} />
            <Route path="/profile/accounts" element={<LegacyRedirect to="/account/linked" />} />
            <Route path="/profile/linked-accounts" element={<LegacyRedirect to="/account/linked" />} />
            <Route path="/profile/sessions" element={<LegacyRedirect to="/account/sessions" />} />
            <Route path="/profile/session-management" element={<LegacyRedirect to="/account/session-management" />} />
            <Route path="/account/sessions/management" element={<LegacyRedirect to="/account/session-management" />} />
            <Route path="/profile/history" element={<LegacyRedirect to="/account/login-history" />} />
            <Route path="/profile/activity" element={<LegacyRedirect to="/account/activity" />} />
            <Route path="/profile/deactivate" element={<LegacyRedirect to="/account/deactivate" />} />
            <Route path="/profile/apps" element={<LegacyRedirect to="/account/linked" />} />

            {/* Authenticated routes */}
            <Route element={<RequireAuth />}>
                <Route element={<MainLayout dark={dark} setDark={setDark} />}>
                    <Route index element={<Home />} />
                    <Route path="home" element={<Home />} />
                    <Route path="account" element={<Home />} />

                    {/* Account Module */}
                    <Route path="account/profile" element={<ProfileRoute />} />
                    <Route path="account/password" element={<PasswordPage />} />
                    <Route path="account/linked" element={<LinkedAccountsRoute />} />
                    <Route path="account/sessions" element={<SessionsRoute />} />
                    <Route path="account/session-management" element={<SessionManagementRoute />} />
                    <Route path="account/login-history" element={<LoginHistoryRoute />} />
                    <Route path="account/activity" element={<AccountActivityRoute />} />
                    <Route path="account/deactivate" element={<DeactivateRoute />} />

                    {/* Admin Module */}
                    <Route
                        path="admin"
                        element={guard(['ROLE_ADMIN', 'ADMIN', ...userPermissions, ...rolePermissions, ...permissionPermissions], <OverviewRoute />)}
                    />
                    <Route path="admin/users" element={guard(['ROLE_ADMIN', 'ADMIN', ...userPermissions], <UserListRoute />)} />
                    <Route path="admin/users/:id" element={guard(['ROLE_ADMIN', 'ADMIN', ...userPermissions], <UserDetailRoute />)} />
                    <Route path="admin/sessions" element={guard(['ROLE_ADMIN', 'ADMIN'], <AdminUserSessionsRoute />)} />
                    <Route path="admin/login-history" element={guard(['ROLE_ADMIN', 'ADMIN'], <AdminUserLoginHistoryRoute />)} />
                    <Route path="admin/roles" element={guard(['ROLE_ADMIN', 'ADMIN', ...rolePermissions], <RoleListRoute />)} />
                    <Route path="admin/roles/:id" element={guard(['ROLE_ADMIN', 'ADMIN', ...rolePermissions], <RoleDetailRoute />)} />
                    <Route
                        path="admin/permissions"
                        element={guard(['ROLE_ADMIN', 'ADMIN', ...permissionPermissions], <AdminPermissionsRoute />)}
                    />
                    <Route path="admin/clients" element={guard(['ROLE_ADMIN', 'ADMIN', ...clientPermissions], <ClientListRoute />)} />
                    <Route path="admin/clients/:id" element={guard(['ROLE_ADMIN', 'ADMIN', ...clientPermissions], <ClientDetailRoute />)} />
                    <Route path="admin/audit-logs" element={guard(['ROLE_ADMIN', 'ADMIN'], <AdminAuditLogsRoute />)} />
                    <Route path="admin/security" element={guard(['ROLE_ADMIN', 'ADMIN'], <SecurityManagementRoute />)} />
                    <Route path="admin/system-config" element={guard(['ROLE_ADMIN', 'ADMIN'], <AdminSystemConfigRoute />)} />

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default AppRouter;
