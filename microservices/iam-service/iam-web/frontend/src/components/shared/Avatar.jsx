import {useEffect, useState} from 'react'
import {getInitials} from '../../utils/accountFormat'

const PALETTES = [
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 ring-indigo-200 dark:ring-indigo-800',
    'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 ring-sky-200 dark:ring-sky-800',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800',
    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 ring-amber-200 dark:ring-amber-800',
    'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 ring-violet-200 dark:ring-violet-800',
    'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 ring-rose-200 dark:ring-rose-800',
    'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 ring-teal-200 dark:ring-teal-800',
    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ring-blue-200 dark:ring-blue-800',
]

function getPalette(key = '') {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i)
        hash |= 0
    }
    return PALETTES[Math.abs(hash) % PALETTES.length]
}

export function resolvePictureUrl(raw) {
    if (!raw || typeof raw !== 'string') return null
    const trimmed = raw.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:image/')) {
        return trimmed
    }
    const match = trimmed.match(/url=([^\s,}]+)/i) || trimmed.match(/"url"\s*:\s*"([^"]+)"/i)
    if (match && match[1]) {
        return match[1]
    }
    return null
}

export default function Avatar({user, className = '', alt = 'Profile avatar'}) {
    const [imageFailed, setImageFailed] = useState(false)
    const pictureUrl = resolvePictureUrl(user?.pictureUrl)

    useEffect(() => setImageFailed(false), [pictureUrl])

    const hasCustomBg = className.includes('bg-')
    const key = user?.username || user?.name || user?.email || ''
    const fallbackPalette = hasCustomBg ? '' : getPalette(key)
    const showImage = Boolean(pictureUrl && !imageFailed)

    return (
        <span
            className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-bold select-none ring-1 ring-black/5 dark:ring-white/10 ${showImage ? 'bg-slate-100 dark:bg-slate-800' : fallbackPalette} ${className}`}
        >
            {showImage ? (
                <img
                    className="size-full object-cover"
                    src={pictureUrl}
                    alt={alt}
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                />
            ) : (
                <span className="tracking-tight text-center leading-none">
                    {getInitials(user)}
                </span>
            )}
        </span>
    )
}
