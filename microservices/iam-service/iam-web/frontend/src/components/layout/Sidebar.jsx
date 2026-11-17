import {useState} from 'react'
import {
    Activity,
    CalendarClock,
    CircleGauge,
    Clock3,
    FileText,
    History,
    KeyRound,
    Laptop,
    Layers,
    LayoutDashboard,
    LifeBuoy,
    Link2,
    LogOut,
    Monitor,
    Settings,
    ShieldAlert,
    ShieldCheck,
    SlidersHorizontal,
    Tags,
    UserRound,
    UserRoundX,
    UsersRound,
} from 'lucide-react'
import {hasAdminRole, managementSections, personalSections} from '../../utils/accountFormat'
import Avatar from '../common/Avatar'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '../ui/sidebar'

const SUPPORT_EMAIL = 'support@istad.co'

const SECTION_META = {
    dashboard: {icon: LayoutDashboard, labelKey: 'navDashboard'},
    profile: {icon: UserRound, labelKey: 'navProfile'},
    security: {icon: ShieldCheck, labelKey: 'navSecurity'},
    linked: {icon: Link2, labelKey: 'navLinked'},
    sessions: {icon: Monitor, labelKey: 'navSessions'},
    sessionManagement: {icon: SlidersHorizontal, labelKey: 'navSessionManagement'},
    history: {icon: History, labelKey: 'navHistory'},
    activity: {icon: Activity, labelKey: 'navActivity'},
    deactivate: {icon: UserRoundX, labelKey: 'navDeactivate'},
    adminOverview: {icon: CircleGauge, labelKey: 'navAdminOverview'},
    users: {icon: UsersRound, labelKey: 'navUsers'},
    roles: {icon: Tags, labelKey: 'navRoles'},
    permissions: {icon: KeyRound, labelKey: 'navPermissions'},
    clients: {icon: Layers, labelKey: 'navClients'},
    userSessions: {icon: Laptop, labelKey: 'navUserSessions'},
    userHistory: {icon: CalendarClock, labelKey: 'navUserHistory'},
    securityManagement: {icon: ShieldAlert, labelKey: 'navSecurityManagement'},
    auditLogs: {icon: FileText, labelKey: 'navAuditLogs'},
    systemConfig: {icon: Settings, labelKey: 'navSystemConfig'},
}

const FALLBACK_SECTION_ICON = Clock3

function translate(t, key, fallback) {
    const value = t?.[key]
    if (value) return value
    if (import.meta.env?.DEV) {
        console.warn(`[i18n] Missing translation key: "${key}"`)
    }
    return fallback
}

export default function AccountSidebar({page, setPage, user, t, onSignOut}) {
    const [logoError, setLogoError] = useState(false)
    const isAdmin = hasAdminRole(user)
    const displayName = user?.name || user?.username || translate(t, 'account', 'Your account')
    const brandName = 'ISTAD Identity'
    const supportLabel = translate(t, 'navSupport', 'Get support')
    const identityLabel = translate(t, 'identityAccess', 'Identity & Access')
    const memberLabel = translate(t, 'identityMember', 'Identity member')
    const signOutLabel = translate(t, 'logout', 'Sign out')

    function renderSection(section) {
        const meta = SECTION_META[section]
        const Icon = meta?.icon ?? FALLBACK_SECTION_ICON
        const label = translate(t, meta?.labelKey, section)
        const isActive = page === section

        return (
            <SidebarMenuItem key={section}>
                <SidebarMenuButton
                    isActive={isActive}
                    tooltip={label}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setPage(section)}
                >
                    <Icon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true"/>
                    <span className="truncate">{label}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
            <SidebarHeader className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip={brandName} onClick={() => setPage('dashboard')}>
                            {logoError ? (
                                <span
                                    aria-hidden="true"
                                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-700 text-lg font-bold text-white">
                                    i
                                </span>
                            ) : (
                                <img
                                    src="/istad.png"
                                    alt="ISTAD logo"
                                    onError={() => setLogoError(true)}
                                    className="size-8 shrink-0 rounded-lg object-contain"
                                />
                            )}
                            <span className="grid min-w-0 flex-1 text-left leading-tight">
                                <span className="truncate text-sm font-medium">
                                    istad <span className="font-normal text-muted-foreground">identity</span>
                                </span>
                                <small className="truncate text-xs text-muted-foreground">{identityLabel}</small>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Only the nav list grows and scrolls */}
            <SidebarContent className="pb-4 [scrollbar-width:thin]">
                <SidebarGroup className="px-3 py-2">
                    <SidebarGroupLabel>{translate(t, 'account', 'Account')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>{personalSections.map(renderSection)}</SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {isAdmin && (
                    <SidebarGroup className="px-3 py-2">
                        <SidebarGroupLabel>{translate(t, 'management', 'Management')}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>{managementSections.map(renderSection)}</SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="gap-2 p-3">
                <SidebarSeparator className="mx-0 w-full"/>
                <SidebarMenu className="gap-1">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={supportLabel}>
                            <a
                                href={`mailto:${SUPPORT_EMAIL}`}
                                className="flex w-full items-center gap-2"
                            >
                                <LifeBuoy className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true"/>
                                <span className="truncate">{supportLabel}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="px-3"
                            tooltip={displayName}
                            onClick={() => setPage('profile')}
                        >
                            <Avatar user={user} className="size-8 text-xs"/>
                            <span className="grid min-w-0 flex-1 text-left leading-tight">
                                <span className="truncate text-xs font-medium">{displayName}</span>
                                <small className="truncate text-xs text-muted-foreground">
                                    {user?.email || memberLabel}
                                </small>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton className="h-10 px-3" tooltip={signOutLabel} onClick={onSignOut}>
                            <LogOut className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true"/>
                            <span>{signOutLabel}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
