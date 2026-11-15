import {useEffect, useState} from 'react'
import {getInitials} from '../../utils/accountFormat'

export default function Avatar({user, className = '', alt = 'Profile avatar'}) {
    const [imageFailed, setImageFailed] = useState(false)
    const pictureUrl = user?.pictureUrl

    useEffect(() => setImageFailed(false), [pictureUrl])

    return <span
        className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-violet-100 font-bold text-violet-800 ${className}`}>
        {pictureUrl && !imageFailed
            ? <img className="size-full object-cover" src={pictureUrl} alt={alt} onError={() => setImageFailed(true)}/>
            : getInitials(user)}
    </span>
}
