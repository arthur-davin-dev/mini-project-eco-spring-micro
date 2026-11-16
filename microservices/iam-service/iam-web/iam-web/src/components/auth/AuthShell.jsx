// export default function AuthShell({title, children, dark, setDark}) {
//     return (
//         <main
//             className="mx-auto my-[7vh] w-[calc(100%-2rem)] max-w-[460px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-8 text-[var(--color-ink)] shadow-xl">
//             <header className="mb-8 flex items-center justify-between font-bold">
//                 <a className="text-slate-900 dark:text-white" href="/account">ISTAD Identity</a>
//                 <nav className="flex items-center gap-2 text-xs font-normal text-slate-500">
//                     <button type="button"
//                             className="rounded border border-slate-200 px-2 py-1 dark:border-slate-700 dark:text-slate-200"
//                             aria-label="Toggle dark mode"
//                             onClick={() => setDark(value => !value)}>{dark ? '☼' : '◐'}</button>
//                     <a href="?lang=en">EN</a> · <a href="?lang=km">ខ្មែរ</a></nav>
//             </header>
//             <h1 className="mb-3 text-2xl font-normal">{title}</h1>
//             {children}
//         </main>
//     )
// }


export default function AuthShell({title, children, dark, setDark}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <main className="w-full max-w-[460px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 sm:p-8 text-[var(--color-ink)] shadow-xl my-auto">
                <header className="mb-6 flex items-center justify-between font-bold">
                    <a className="text-slate-900 dark:text-white" href="/account">ISTAD Identity</a>
                    <nav aria-label="Preferences" className="flex items-center gap-2 text-xs font-normal text-slate-500">
                        <button
                            type="button"
                            className="rounded border border-slate-200 px-2 py-1 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
                            aria-label="Dark mode"
                            aria-pressed={dark}
                            onClick={() => setDark(value => !value)}
                        >
                            {dark ? '☼' : '◐'}
                        </button>
                        <a href="?lang=en" lang="en" hrefLang="en">EN</a>
                        <span aria-hidden="true">·</span>
                        <a href="?lang=km" lang="km" hrefLang="km">ខ្មែរ</a>
                    </nav>
                </header>
                <h1 className="mb-2 text-2xl font-normal">{title}</h1>
                {children}
            </main>
        </div>
    )
}