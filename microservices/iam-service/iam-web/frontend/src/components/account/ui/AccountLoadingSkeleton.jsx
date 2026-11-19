import {Skeleton} from '../../ui/skeleton'

const card = 'rounded-xl border border-[var(--color-line)] bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900'

function NavigationSkeleton({count = 6}) {
    return <div className="grid gap-2.5 px-3">
        {Array.from({length: count}, (_, index) => <div className="flex h-9 items-center gap-3" key={index}>
            <Skeleton className="size-4 rounded"/><Skeleton className={`h-3 ${index % 2 ? 'w-24' : 'w-32'}`}/>
        </div>)}
    </div>
}

export default function AccountLoadingSkeleton({label}) {
    return <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]" aria-busy="true"
                aria-label={label}>
        <aside
            className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[var(--color-line)] bg-white p-4 md:flex dark:border-slate-800 dark:bg-slate-950"
            aria-hidden="true">
            <div className="flex h-12 items-center gap-3 px-2"><Skeleton className="size-8 rounded-lg"/>
                <div className="grid gap-2"><Skeleton className="h-3 w-28"/><Skeleton className="h-2.5 w-20"/></div>
            </div>
            <Skeleton className="mx-2 mb-3 mt-10 h-2.5 w-16"/><Skeleton className="mx-2 mb-8 h-11 rounded-lg"/>
            <Skeleton className="mx-3 mb-3 h-2.5 w-14"/><NavigationSkeleton/>
            <div className="mt-auto grid gap-4"><Skeleton className="h-20 rounded-lg"/>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"><Skeleton
                    className="size-8 rounded-full"/>
                    <div className="grid gap-2"><Skeleton className="h-2.5 w-24"/><Skeleton className="h-2.5 w-32"/>
                    </div>
                </div>
            </div>
        </aside>
        <main className="md:ml-64">
            <header
                className="flex h-14 items-center justify-between border-b border-[var(--color-line)] bg-white px-5 dark:border-slate-800 dark:bg-slate-950"
                aria-hidden="true">
                <div className="flex items-center gap-3"><Skeleton className="size-8 rounded-md"/><Skeleton
                    className="h-3 w-28"/></div>
                <div className="flex items-center gap-3"><Skeleton className="h-8 w-20 rounded-md"/><Skeleton
                    className="size-8 rounded-full"/></div>
            </header>
            <div className="mx-auto max-w-[1110px] space-y-5 px-5 py-7 lg:px-10">
                <div className="flex items-end justify-between" aria-hidden="true">
                    <div className="grid gap-3"><Skeleton className="h-2.5 w-28"/><Skeleton
                        className="h-7 w-56"/><Skeleton className="h-3 w-64"/></div>
                    <Skeleton className="h-9 w-28 rounded-lg"/></div>
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
                    {Array.from({length: 4}, (_, index) => <div className={card} key={index}><Skeleton
                        className="h-3 w-28"/><Skeleton className="mt-3 h-6 w-20"/></div>)}
                </section>
                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(230px,.8fr)]"
                     aria-hidden="true">
                    <section
                        className="rounded-xl border border-[var(--color-line)] bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center gap-3"><Skeleton className="size-9 rounded-lg"/>
                            <div className="grid gap-2"><Skeleton className="h-3.5 w-36"/><Skeleton
                                className="h-2.5 w-48"/></div>
                            <Skeleton className="ml-auto h-8 w-20 rounded-md"/></div>
                        <div
                            className="mt-5 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                            <Skeleton className="size-11 rounded-full"/>
                            <div className="grid gap-2"><Skeleton className="h-3 w-36"/><Skeleton
                                className="h-2.5 w-24"/></div>
                        </div>
                        <div
                            className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">{Array.from({length: 4}, (_, index) =>
                            <div className="grid gap-2" key={index}><Skeleton className="h-2.5 w-16"/><Skeleton
                                className="h-3 w-36"/></div>)}</div>
                    </section>
                    <section className="grid gap-2.5"><Skeleton
                        className="mb-1 h-4 w-24"/>{Array.from({length: 3}, (_, index) => <div
                        className={`${card} flex items-center gap-3`} key={index}><Skeleton
                        className="size-9 rounded-lg"/>
                        <div className="grid gap-2"><Skeleton className="h-3 w-24"/><Skeleton className="h-2.5 w-36"/>
                        </div>
                    </div>)}</section>
                </div>
            </div>
        </main>
        <span className="sr-only" role="status">{label}</span>
    </div>
}
