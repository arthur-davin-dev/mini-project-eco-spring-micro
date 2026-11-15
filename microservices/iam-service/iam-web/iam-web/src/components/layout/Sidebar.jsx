import {
    Activity,
    CalendarClock,
    CircleGauge,
    Clock3,
    History,
    KeyRound,
    LayoutDashboard,
    Link2,
    LogOut,
    Monitor,
    ShieldCheck,
    SlidersHorizontal,
    Tags,
    UserRound,
    UserRoundX,
    UsersRound,
    Layers,
    Laptop,
    ShieldAlert,
    FileText,
    Settings,
    ExternalLink
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

    function renderSection(section) {
        const label = t[`nav${section[0].toUpperCase()}${section.slice(1)}`] || section
        const Icon = sectionIcons[section] || Clock3
        return (
            <SidebarMenuItem key={section}>
                <SidebarMenuButton isActive={page === section} tooltip={label} onClick={() => setPage(section)}>
                    <Icon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                    <span className="truncate">{label}</span>
                    {section === 'profile' && user && <span className="ml-auto size-1.5 rounded-full bg-emerald-500" />}
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
            <SidebarHeader className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip="ISTAD Identity" onClick={() => setPage('dashboard')}>
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-700 text-lg font-bold text-white">
                                i
                            </span>
                            <span className="grid min-w-0 flex-1 text-left leading-tight">
                                <span className="truncate text-sm font-medium">
                                    istad <span className="font-normal text-muted-foreground">identity</span>
                                </span>
                                <small className="truncate text-xs text-muted-foreground">Identity &amp; Access</small>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{t.account || 'Account'}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>{personalSections.map(renderSection)}</SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>{t.management || 'Management'}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>{managementSections.map(renderSection)}</SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="gap-3 p-3">
                <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                    <span className="text-xs font-medium">Need a hand?</span>
                    <p className="mt-1 text-xs leading-4 text-muted-foreground">
                        Visit the IAM documentation or contact identity support.
                    </p>
                    <a
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-700 dark:text-violet-300"
                        href="mailto:support@istad.co"
                    >
                        Get support <ExternalLink className="size-3" />
                    </a>
                </div>
                <SidebarSeparator className="mx-0 w-full" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip={user?.name || user?.username || t.account}>
                            <Avatar user={user} className="size-8 text-xs" />
                            <span className="grid min-w-0 flex-1 text-left leading-tight">
                                <span className="truncate text-xs font-medium">{user?.name || user?.username || 'Your account'}</span>
                                <small className="truncate text-xs text-muted-foreground">
                                    {user?.email || 'Identity member'}
                                </small>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip={t.logout || 'Sign out'} onClick={onSignOut}>
                            <LogOut className="size-4" strokeWidth={1.8} aria-hidden="true" />
                            <span>{t.logout || 'Sign out'}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
