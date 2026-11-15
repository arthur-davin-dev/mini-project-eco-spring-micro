import {Languages, Moon, Sun} from 'lucide-react'
import Avatar from '../common/Avatar'
import {SidebarTrigger} from '../ui/sidebar'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select'

export default function Topbar({pageTitle, locale, setLocale, t, user, dark, setDark}) {
    return (
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--color-line)] bg-white/95 px-8 backdrop-blur max-[760px]:px-4 dark:border-slate-800 dark:bg-slate-950/95">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="mr-1 shrink-0"/>
                <div className="flex items-center gap-2 text-xs">
                    <span className="hidden text-slate-500 sm:inline">{t.account}</span>
                    <span className="hidden text-slate-300 sm:inline">/</span>
                    <span className="truncate font-medium text-slate-800 dark:text-white">{pageTitle}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Languages className="size-4" aria-hidden="true"/>
                    <Select value={locale} onValueChange={setLocale}>
                        <SelectTrigger className="h-8 w-[88px] border-0 bg-transparent px-1 text-xs shadow-none" aria-label={t.language}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="en">EN</SelectItem>
                            <SelectItem value="km">ខ្មែរ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <button
                    className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                    aria-label={t.theme}
                    onClick={() => setDark((value) => !value)}
                >
                    {dark ? <Sun className="size-4 text-amber-500"/> : <Moon className="size-4 text-slate-600 dark:text-slate-300"/>}
                </button>
                <Avatar user={user} className="size-8 text-xs"/>
            </div>
        </header>
    )
}