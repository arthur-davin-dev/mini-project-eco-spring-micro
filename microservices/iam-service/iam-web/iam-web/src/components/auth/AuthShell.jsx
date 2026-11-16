// import {Sun, Moon} from 'lucide-react'
//
// export default function AuthShell({title, children, dark, setDark}) {
//     const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
//     const langParam = searchParams.get('lang')
//     const isKm = langParam === 'km' || (!langParam && typeof window !== 'undefined' && (localStorage.getItem('iam-locale') === 'km' || localStorage.getItem('iam-lang') === 'km'))
//
//     function switchLang(targetLang) {
//         if (typeof window === 'undefined') return '?'
//         const sp = new URLSearchParams(window.location.search)
//         sp.set('lang', targetLang)
//         localStorage.setItem('iam-locale', targetLang)
//         localStorage.setItem('iam-lang', targetLang)
//         return `?${sp.toString()}`
//     }
//
//     return (
//         <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
//             {/* Atmospheric ambient background glow */}
//             <div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[580px] rounded-full bg-gradient-to-b from-violet-500/15 via-indigo-500/10 to-transparent blur-3xl dark:from-violet-600/20 dark:via-indigo-600/10 dark:to-transparent"
//             />
//             <div
//                 aria-hidden="true"
//                 className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 size-[480px] rounded-full bg-gradient-to-t from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl dark:from-indigo-950/40 dark:to-transparent"
//             />
//
//             <main className="relative z-10 w-full max-w-[460px] rounded-2xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 text-slate-900 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-2xl dark:shadow-black/50 transition-all my-auto">
//                 <header className="mb-6 flex items-center justify-between gap-3">
//                     <a href="/account" className="flex items-center gap-2.5 group transition">
//                         <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-violet-700 to-indigo-600 text-base font-bold text-white shadow-md shadow-violet-600/20 group-hover:from-violet-600 group-hover:to-indigo-500 transition">
//                             i
//                         </span>
//                         <span className="grid min-w-0 text-left leading-tight">
//                             <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
//                                 istad <span className="font-normal text-slate-500 dark:text-slate-400">identity</span>
//                             </span>
//                             <span className="text-[11px] text-slate-400 dark:text-slate-500">
//                                 {isKm ? 'សេវាអត្តសញ្ញាណ' : 'Identity & Access'}
//                             </span>
//                         </span>
//                     </a>
//
//                     <nav aria-label="Preferences" className="flex items-center gap-1.5">
//                         {/* Theme Toggle Icon Button */}
//                         <button
//                             type="button"
//                             className="flex size-8.5 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/80 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer"
//                             aria-label="Toggle theme"
//                             aria-pressed={dark}
//                             onClick={() => setDark(value => !value)}
//                             title={dark ? (isKm ? 'ប្តូរទៅពន្លឺ' : 'Switch to light mode') : (isKm ? 'ប្តូរទៅងងឹត' : 'Switch to dark mode')}
//                         >
//                             {dark ? (
//                                 <Sun className="size-4 text-amber-400 transition" />
//                             ) : (
//                                 <Moon className="size-4 text-slate-600 transition" />
//                             )}
//                         </button>
//
//                         {/* Segmented Language Switcher with Flag Images */}
//                         <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50/80 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-800/80">
//                             <a
//                                 href={switchLang('en')}
//                                 lang="en"
//                                 hrefLang="en"
//                                 className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
//                                     !isKm
//                                         ? 'bg-white text-violet-700 font-semibold shadow-2xs dark:bg-slate-900 dark:text-violet-300'
//                                         : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
//                                 }`}
//                             >
//                                 <img
//                                     src="/flags/en.png"
//                                     alt="United Kingdom"
//                                     className="h-3 w-4.5 rounded-[2px] object-cover shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
//                                 />
//                                 <span>EN</span>
//                             </a>
//                             <a
//                                 href={switchLang('km')}
//                                 lang="km"
//                                 hrefLang="km"
//                                 className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
//                                     isKm
//                                         ? 'bg-white text-violet-700 font-semibold shadow-2xs dark:bg-slate-900 dark:text-violet-300'
//                                         : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
//                                 }`}
//                             >
//                                 <img
//                                     src="/flags/km.png"
//                                     alt="Cambodia"
//                                     className="h-3 w-4.5 rounded-[2px] object-cover shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
//                                 />
//                                 <span>ខ្មែរ</span>
//                             </a>
//                         </div>
//                     </nav>
//                 </header>
//
//                 {title && (
//                     <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
//                         {title}
//                     </h1>
//                 )}
//                 {children}
//             </main>
//         </div>
//     )
// }


import {Sun, Moon} from 'lucide-react'
import {getInitialIsKm} from './authShared.jsx'

export default function AuthShell({title, children, dark, setDark}) {
    const isKm = getInitialIsKm()

    function switchLang(targetLang) {
        if (typeof window === 'undefined') return '?'
        const sp = new URLSearchParams(window.location.search)
        sp.set('lang', targetLang)
        localStorage.setItem('iam-locale', targetLang)
        localStorage.setItem('iam-lang', targetLang)
        return `?${sp.toString()}`
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[580px] rounded-full bg-gradient-to-b from-violet-500/15 via-indigo-500/10 to-transparent blur-3xl dark:from-violet-600/20 dark:via-indigo-600/10 dark:to-transparent"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 size-[480px] rounded-full bg-gradient-to-t from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl dark:from-indigo-950/40 dark:to-transparent"
            />

            <main className="relative z-10 my-auto w-full max-w-[460px] rounded-2xl border border-slate-200/80 bg-white/95 p-6 text-slate-900 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all sm:p-8 dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-2xl dark:shadow-black/50">
                <header className="mb-6 flex items-center justify-between gap-3">
                    <a href="/account" className="group flex items-center gap-2.5 transition">
                        <img
                            src="/istad.png"
                            alt="ISTAD logo"
                            className="size-9 shrink-0 rounded-xl object-contain transition group-hover:opacity-90"
                        />
                        <span className="grid min-w-0 text-left leading-tight">
                            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                                istad <span className="font-normal text-slate-500 dark:text-slate-400">identity</span>
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                {isKm ? 'សេវាអត្តសញ្ញាណ' : 'Identity & Access'}
                            </span>
                        </span>
                    </a>

                    <nav aria-label="Preferences" className="flex items-center gap-1.5">
                        <button
                            type="button"
                            className="flex size-8.5 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/80 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                            aria-label={isKm ? 'ប្តូររបៀបងងឹត/ពន្លឺ' : 'Toggle theme'}
                            aria-pressed={dark}
                            onClick={() => setDark(value => !value)}
                            title={dark ? (isKm ? 'ប្តូរទៅពន្លឺ' : 'Switch to light mode') : (isKm ? 'ប្តូរទៅងងឹត' : 'Switch to dark mode')}
                        >
                            {dark ? (
                                <Sun className="size-4 text-amber-400 transition" aria-hidden="true"/>
                            ) : (
                                <Moon className="size-4 text-slate-600 transition" aria-hidden="true"/>
                            )}
                        </button>

                        <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50/80 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-800/80">
                            <a
                                href={switchLang('en')}
                                lang="en"
                                hrefLang="en"
                                aria-current={!isKm ? 'true' : undefined}
                                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
                                    !isKm
                                        ? 'bg-white font-semibold text-violet-700 shadow-2xs dark:bg-slate-900 dark:text-violet-300'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                <img
                                    src="/flags/en.png"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-3 w-4.5 shrink-0 rounded-[2px] border border-slate-200/60 object-cover shadow-2xs dark:border-slate-700/60"
                                />
                                <span>EN</span>
                            </a>
                            <a
                                href={switchLang('km')}
                                lang="km"
                                hrefLang="km"
                                aria-current={isKm ? 'true' : undefined}
                                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
                                    isKm
                                        ? 'bg-white font-semibold text-violet-700 shadow-2xs dark:bg-slate-900 dark:text-violet-300'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                <img
                                    src="/flags/km.png"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-3 w-4.5 shrink-0 rounded-[2px] border border-slate-200/60 object-cover shadow-2xs dark:border-slate-700/60"
                                />
                                <span>ខ្មែរ</span>
                            </a>
                        </div>
                    </nav>
                </header>

                {title && (
                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h1>
                )}
                {children}
            </main>
        </div>
    )
}
