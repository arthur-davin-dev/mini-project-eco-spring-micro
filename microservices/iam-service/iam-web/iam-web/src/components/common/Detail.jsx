export default function Detail({label, value, tag}) {
    return (
        <div className="grid min-w-0 gap-1.5">
            <span className="text-[11px] text-slate-500">{label}</span>
            <b className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
                {value || <span className="font-normal text-slate-400">Not provided</span>}
                {tag && <i className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium not-italic text-emerald-700">✓ {tag}</i>}
            </b>
        </div>
    )
}
