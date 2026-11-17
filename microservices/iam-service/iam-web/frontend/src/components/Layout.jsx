import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import { Alert, Toast } from './common/Feedback';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import { managementSections, sectionTitleKeys } from '../utils/accountFormat';

const sectionRouteMap = {
    dashboard: '/home',
    profile: '/account/profile',
    security: '/account/password',
    linked: '/account/linked',
    sessions: '/account/sessions',
    sessionManagement: '/account/session-management',
    history: '/account/login-history',
    activity: '/account/activity',
    deactivate: '/account/deactivate',
    adminOverview: '/admin',
    users: '/admin/users',
    roles: '/admin/roles',
    permissions: '/admin/permissions',
    clients: '/admin/clients',
    userSessions: '/admin/sessions',
    userHistory: '/admin/login-history',
    securityManagement: '/admin/security',
    auditLogs: '/admin/audit-logs',
    systemConfig: '/admin/system-config',
};

function getSectionFromPath(pathname) {
    if (pathname.startsWith('/admin/users')) return 'users';
    if (pathname.startsWith('/admin/roles')) return 'roles';
    if (pathname.startsWith('/admin/permissions')) return 'permissions';
    if (pathname.startsWith('/admin/clients')) return 'clients';
    if (pathname.startsWith('/admin/security')) return 'securityManagement';
    if (pathname.startsWith('/admin/sessions')) return 'userSessions';
    if (pathname.startsWith('/admin/login-history')) return 'userHistory';
    if (pathname.startsWith('/admin/audit-logs')) return 'auditLogs';
    if (pathname.startsWith('/admin/system-config')) return 'systemConfig';
    if (pathname === '/admin' || pathname === '/admin/') return 'adminOverview';

    if (pathname.startsWith('/account/password')) return 'security';
    if (pathname.startsWith('/account/linked')) return 'linked';
    if (pathname.startsWith('/account/session-management')) return 'sessionManagement';
    if (pathname.startsWith('/account/sessions')) return 'sessions';
    if (pathname.startsWith('/account/login-history')) return 'history';
    if (pathname.startsWith('/account/activity')) return 'activity';
    if (pathname.startsWith('/account/deactivate')) return 'deactivate';
    if (pathname.startsWith('/account/profile')) return 'profile';
    if (pathname === '/home' || pathname === '/account') return 'dashboard';

    return 'profile';
}

export default function Layout({ dark: propDark, setDark: propSetDark }) {
    const { user, locale, setLocale, t, clearToken, error, setError } = useAuth();
    const location = useLocation();
    const routerNavigate = useNavigate();
    const [toast, setToast] = useState('');

    const [internalDark, setInternalDark] = useState(() => localStorage.getItem('iam-theme') === 'dark');
    const dark = propDark !== undefined ? propDark : internalDark;
    const setDark = (value) => {
        const nextDark = typeof value === 'function' ? value(dark) : value;
        if (propSetDark) {
            propSetDark(nextDark);
        } else {
            setInternalDark(nextDark);
            document.documentElement.classList.toggle('dark', nextDark);
            localStorage.setItem('iam-theme', nextDark ? 'dark' : 'light');
        }
    };

    const currentSection = useMemo(() => getSectionFromPath(location.pathname), [location.pathname]);
    const pageTitle = t[sectionTitleKeys[currentSection]] || t.profile || 'Account';

    function handleNavigate(section) {
        const targetPath = sectionRouteMap[section] || '/account/profile';
        routerNavigate(targetPath);
    }

    async function handleSignOut() {
        clearToken();
        try {
            const csrfRes = await fetch('/account/csrf', { credentials: 'same-origin' });
            if (csrfRes.ok) {
                const csrf = await csrfRes.json();
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/logout';
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = csrf.parameterName || '_csrf';
                input.value = csrf.token;
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
                return;
            }
        } catch {
            // ignore network/parse errors
        }
        window.location.href = '/login';
    }

    return (
        <SidebarProvider className="min-h-svh bg-[var(--color-canvas)] text-[var(--color-ink)]">
            <Sidebar
                page={currentSection}
                setPage={handleNavigate}
                user={user}
                t={t}
                onSignOut={handleSignOut}
            />
            <SidebarInset className="min-w-0 flex-1 bg-[var(--color-canvas)]">
                <Topbar
                    pageTitle={pageTitle}
                    locale={locale}
                    setLocale={setLocale}
                    t={t}
                    user={user}
                    dark={dark}
                    setDark={setDark}
                />

                <div className="w-full max-w-none px-6 sm:px-8 pb-8 pt-6 flex-1">
                    <div className="mb-6">
                        <div className="mb-1 text-xs font-medium text-slate-400">
                            {managementSections.includes(currentSection)
                                ? (t.management || 'Management')
                                : (t.account || 'Account')}
                            <span className="px-1.5">·</span>
                            {t.settings || 'Settings'}
                        </div>
                        <h1 className="m-0 text-2xl font-normal tracking-tight text-slate-900 dark:text-white">
                            {currentSection === 'dashboard'
                                ? `${t.hello || 'Welcome'}${user?.givenName ? `, ${user.givenName}` : ''}`
                                : pageTitle}
                        </h1>
                    </div>

                    <Alert message={error} onDismiss={() => setError('')} />
                    <Toast message={toast} />

                    <Outlet context={{ dark, setDark, setToast, handleSignOut }} />

                    <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-xs text-slate-400 dark:border-slate-800">
                        <span>© {new Date().getFullYear()} ISTAD Identity Platform</span>
                        <span>Multi-Tenant Enterprise IAM</span>
                        <a className="inline-flex items-center gap-1 hover:text-violet-700" href="mailto:support@istad.co">
                            Help &amp; Support <ExternalLink className="size-3" />
                        </a>
                    </footer>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
