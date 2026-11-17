import { getCachedBrowser } from '../../utils/browserDetection';

const API_BASE_URL = import.meta.env.VITE_IAM_API_URL || ''

export async function apiRequest(path, {token, ...options} = {}) {
    const cachedBrowser = getCachedBrowser();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body ? {'Content-Type': 'application/json'} : {}),
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...(cachedBrowser ? {'X-Client-Browser': cachedBrowser} : {}),
            ...options.headers,
        },
    })

    if (!response.ok) {
        const error = new Error(`IAM request failed (${response.status})`)
        error.status = response.status
        try {
            const problem = await response.clone().json()
            error.detail = problem.detail || problem.message || ''
        } catch {
            error.detail = ''
        }
        throw error
    }
    if (response.status === 204) return null
    return response.json()
}
