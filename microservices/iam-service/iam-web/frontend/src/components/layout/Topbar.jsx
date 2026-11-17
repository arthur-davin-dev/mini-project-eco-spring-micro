import {Moon, Sun} from 'lucide-react'
import Avatar from '../common/Avatar'
import {SidebarTrigger} from '../ui/sidebar'
import {Select, SelectContent, SelectItem, SelectTrigger} from '../ui/select'

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
            <div className="flex items-center gap-2.5">
                {/* Language Switcher with Flag Image & Consistent Fixed Width */}
                <Select value={locale} onValueChange={setLocale}>
                    <SelectTrigger
                        className="h-8 w-[94px] justify-between gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/70 px-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-600 cursor-pointer"
                        aria-label={t.language}
                    >
                        <span className="flex items-center gap-1.5 min-w-0">
                            <img
                                src={locale === 'km' ? '/flags/km.png' : '/flags/en.png'}
                                alt={locale === 'km' ? 'Cambodia' : 'United Kingdom'}
                                className="h-3.5 w-5 rounded-[2px] object-cover shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs">
                                {locale === 'km' ? 'ខ្មែរ' : 'EN'}
                            </span>
                        </span>
                    </SelectTrigger>
                    <SelectContent align="end" className="min-w-[140px] p-1">
                        <SelectItem value="en" className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer">
                            <img
                                src="/flags/en.png"
                                alt="English"
                                className="h-3.5 w-5 rounded-[2px] object-cover shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                            />
                            <span className="font-medium text-xs">English</span>
                            <span className="text-[10px] text-slate-400 font-semibold ml-auto mr-3">EN</span>
                        </SelectItem>
                        <SelectItem value="km" className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer">
                            <img
                                src="/flags/km.png"
                                alt="Khmer"
                                className="h-3.5 w-5 rounded-[2px] object-cover shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                            />
                            <span className="font-medium text-xs">ខ្មែរ</span>
                            <span className="text-[10px] text-slate-400 font-semibold ml-auto mr-3">KM</span>
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Theme Toggle Button matching exact height & style */}
                <button
                    className="grid size-8 place-items-center rounded-lg border border-slate-200/90 bg-slate-50/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-600 transition cursor-pointer"
                    aria-label={t.theme}
                    onClick={() => setDark((value) => !value)}
                >
                    {dark ? <Sun className="size-4 text-amber-500"/> : <Moon className="size-4 text-slate-600 dark:text-slate-300"/>}
                </button>

                {/* User Avatar */}
                <Avatar user={user} className="size-8 text-xs border border-slate-200/80 dark:border-slate-700 shadow-2xs"/>
            </div>
        </header>
    )
}
