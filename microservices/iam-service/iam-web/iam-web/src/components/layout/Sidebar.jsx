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

const sectionIcons = {
    dashboard: LayoutDashboard,
    profile: UserRound,
    security: ShieldCheck,
    linked: Link2,
    sessions: Monitor,
    sessionManagement: SlidersHorizontal,
    history: History,
    activity: Activity,
    deactivate: UserRoundX,
    adminOverview: CircleGauge,
    users: UsersRound,
    roles: Tags,
    permissions: KeyRound,
    clients: Layers,
    userSessions: Laptop,
    userHistory: CalendarClock,
    securityManagement: ShieldAlert,
    auditLogs: FileText,
    systemConfig: Settings,
}

export default function AccountSidebar({page, setPage, user, t, onSignOut}) {
    const isAdmin = hasAdminRole(user)
    const displayName = user?.name || user?.username || t.account || 'Your account'

    function renderSection(section) {
        const label = t[`nav${section[0].toUpperCase()}${section.slice(1)}`] || section
        const Icon = sectionIcons[section] || Clock3
        return (
            <SidebarMenuItem key={section}>
                <SidebarMenuButton isActive={page === section} tooltip={label} onClick={() => setPage(section)}>
                    <Icon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true"/>
                    <span className="truncate">{label}</span>
                    {section === 'profile' && user && (
                        <span className="ml-auto size-1.5 rounded-full bg-emerald-500" aria-hidden="true"/>
                    )}
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
            <SidebarHeader className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip="ISTAD Identity" onClick={() => setPage('dashboard')}>
                            <span
                                className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-700 text-lg font-bold text-white">
                                i
                            </span>
                            <span className="grid min-w-0 flex-1 text-left leading-tight">
                                <span className="truncate text-sm font-medium">
                                    istad <span className="font-normal text-muted-foreground">identity</span>
                                </span>
                                <small className="truncate text-xs text-muted-foreground">
                                    {t.identityAccess || 'Identity & Access'}
                                </small>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* The nav list is the only part that should grow and scroll */}
            <SidebarContent className="[scrollbar-width:thin] pb-4">
                <SidebarGroup className="px-3 py-2">
                    <SidebarGroupLabel>{t.account || 'Account'}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>{personalSections.map(renderSection)}</SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {isAdmin && (
                    <SidebarGroup className="px-3 py-2">
                        <SidebarGroupLabel>{t.management || 'Management'}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>{managementSections.map(renderSection)}</SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Compact footer: 3 rows instead of a card + 2 rows */}
            <SidebarFooter className="gap-2 p-3">
                <SidebarSeparator className="mx-0 w-full"/>
                <SidebarMenu className="gap-1">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={t.navSupport || 'Get support'}>
                            <a href="mailto:support@istad.co">
                                <LifeBuoy className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true"/>
                                <span className="truncate">{t.navSupport || 'Get support'}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="px-3" tooltip={displayName} onClick={() => setPage('profile')}>
                            <Avatar user={user} className="size-8 text-xs"/>
                            <span className="grid min-w-0 flex-1 text-left leading-tight">
                                <span className="truncate text-xs font-medium">{displayName}</span>
                                <small className="truncate text-xs text-muted-foreground">
                                    {user?.email || t.identityMember || 'Identity member'}
                                </small>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="h-10 px-3" tooltip={t.logout || 'Sign out'} onClick={onSignOut}>
                            <LogOut className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true"/>
                            <span>{t.logout || 'Sign out'}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}