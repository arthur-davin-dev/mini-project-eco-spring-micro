import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CALLBACK_PATH } from './config';
import { useAuth } from './auth/AuthContext';
import { RequireAuth, RequireAuthority } from './auth/guards';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ExpiredPassword from './pages/ExpiredPassword';
import Consent from './pages/Consent';
import Callback from './pages/Callback';

// Account pages
import Profile from './pages/account/Profile';
import Password from './pages/account/Password';
import LinkedAccounts from './pages/account/LinkedAccounts';
import Sessions from './pages/account/Sessions';
import SessionManagement from './pages/account/SessionManagement';
import LoginHistory from './pages/account/LoginHistory';
import AccountActivity from './pages/account/AccountActivity';
import Deactivate from './pages/account/Deactivate';

// Admin pages
import Overview from './pages/admin/Overview';
import UserList from './pages/admin/UserList';
import UserDetail from './pages/admin/UserDetail';
import UserSessions from './pages/admin/UserSessions';
import AdminLoginHistory from './pages/admin/AdminLoginHistory';
import RoleList from './pages/admin/RoleList';
import RoleDetail from './pages/admin/RoleDetail';
import PermissionList from './pages/admin/PermissionList';
import ClientList from './pages/admin/ClientList';
import ClientDetail from './pages/admin/ClientDetail';
import AuditLogs from './pages/admin/AuditLogs';
import SystemConfig from './pages/admin/SystemConfig';
import SecurityManagement from './pages/admin/SecurityManagement';

import { useI18n } from './i18n';

const userPermissions = ['user:read', 'user:create', 'user:update', 'user:delete', 'user:assign'];
const rolePermissions = ['role:read', 'role:create', 'role:update', 'role:delete', 'role:assign'];
const permissionPermissions = ['permission:read', 'permission:create', 'permission:update', 'permission:delete'];
const clientPermissions = ['user:read', 'user:create', 'user:update', 'user:delete'];

const guard = (any, element) => <RequireAuthority any={any}>{element}</RequireAuthority>;

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

export default function App() {
    const [dark, setDark] = useState(() => localStorage.getItem('iam-theme') === 'dark');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('iam-theme', dark ? 'dark' : 'light');
    }, [dark]);

    return (
        <Routes>
            {/* Public auth & OAuth2 routes */}
            <Route path="/login" element={<Login dark={dark} setDark={setDark} />} />
            <Route path="/register" element={<Register dark={dark} setDark={setDark} />} />
            <Route path="/forgot-password" element={<ExpiredPassword dark={dark} setDark={setDark} />} />
            <Route path="/reset-password" element={<ExpiredPassword dark={dark} setDark={setDark} />} />
            <Route path="/expired-password" element={<ExpiredPassword dark={dark} setDark={setDark} />} />
            <Route path="/oauth2/consent" element={<Consent dark={dark} setDark={setDark} />} />
            <Route path={CALLBACK_PATH} element={<Callback />} />
            <Route path="/callback" element={<Callback />} />

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

            <Route element={<RequireAuth />}>
                <Route element={<Layout dark={dark} setDark={setDark} />}>
                    <Route index element={<Home />} />
                    <Route path="home" element={<Home />} />
                    <Route path="account" element={<Home />} />

                    {/* Account module (+40 pts) */}
                    <Route path="account/profile" element={<Profile />} />
                    <Route path="account/password" element={<Password />} />
                    <Route path="account/linked" element={<LinkedAccounts />} />
                    <Route path="account/sessions" element={<Sessions />} />
                    <Route path="account/session-management" element={<SessionManagement />} />
                    <Route path="account/login-history" element={<LoginHistory />} />
                    <Route path="account/activity" element={<AccountActivity />} />
                    <Route path="account/deactivate" element={<Deactivate />} />

                    {/* Management module */}
                    <Route
                        path="admin"
                        element={guard(['ROLE_ADMIN', 'ADMIN', ...userPermissions, ...rolePermissions, ...permissionPermissions], <Overview />)}
                    />
                    <Route path="admin/users" element={guard(['ROLE_ADMIN', 'ADMIN', ...userPermissions], <UserList />)} />
                    <Route path="admin/users/:id" element={guard(['ROLE_ADMIN', 'ADMIN', ...userPermissions], <UserDetail />)} />
                    <Route path="admin/sessions" element={guard(['ROLE_ADMIN', 'ADMIN'], <UserSessions />)} />
                    <Route path="admin/login-history" element={guard(['ROLE_ADMIN', 'ADMIN'], <AdminLoginHistory />)} />
                    <Route path="admin/roles" element={guard(['ROLE_ADMIN', 'ADMIN', ...rolePermissions], <RoleList />)} />
                    <Route path="admin/roles/:id" element={guard(['ROLE_ADMIN', 'ADMIN', ...rolePermissions], <RoleDetail />)} />
                    <Route
                        path="admin/permissions"
                        element={guard(['ROLE_ADMIN', 'ADMIN', ...permissionPermissions], <PermissionList />)}
                    />
                    <Route path="admin/clients" element={guard(['ROLE_ADMIN', 'ADMIN', ...clientPermissions], <ClientList />)} />
                    <Route path="admin/clients/:id" element={guard(['ROLE_ADMIN', 'ADMIN', ...clientPermissions], <ClientDetail />)} />
                    <Route path="admin/audit-logs" element={guard(['ROLE_ADMIN', 'ADMIN'], <AuditLogs />)} />
                    <Route path="admin/security" element={guard(['ROLE_ADMIN', 'ADMIN'], <SecurityManagement />)} />
                    <Route path="admin/system-config" element={guard(['ROLE_ADMIN', 'ADMIN'], <SystemConfig />)} />

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
        </Routes>
    );
}
