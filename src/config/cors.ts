import type { CorsOptions } from 'cors'

/** Always allowed (local Vite). */
const DEFAULT_ALLOWED_ORIGINS = [
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:3000',
	'http://127.0.0.1:3000',
]

function isVercelAppOrigin(origin: string): boolean {
	try {
		const { protocol, hostname } = new URL(origin)
		return protocol === 'https:' && hostname.endsWith('.vercel.app')
	} catch {
		return false
	}
}

function parseEnvOrigins(): string[] {
	const raw = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL]
		.filter(Boolean)
		.join(',')

	if (!raw.trim()) {
		return []
	}

	return raw
		.split(',')
		.map(value => value.trim())
		.filter(Boolean)
}

function buildAllowedOriginSet(): Set<string> {
	const set = new Set(DEFAULT_ALLOWED_ORIGINS)
	for (const origin of parseEnvOrigins()) {
		set.add(origin)
	}
	return set
}

const allowedOriginSet = buildAllowedOriginSet()

export function isOriginAllowed(origin: string | undefined): boolean {
	if (!origin) {
		return true
	}

	if (allowedOriginSet.has(origin)) {
		return true
	}

	return isVercelAppOrigin(origin)
}

/**
 * Dynamic origin required when credentials: true (wildcard * is invalid).
 */
export const corsOptions: CorsOptions = {
	origin(origin, callback) {
		if (isOriginAllowed(origin)) {
			callback(null, origin ?? true)
			return
		}

		callback(new Error(`CORS blocked for origin: ${origin}`))
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	optionsSuccessStatus: 204,
}

/** For logs / documentation. */
export function getConfiguredCorsOrigins(): {
	staticOrigins: string[]
	vercelPattern: string
	envOrigins: string[]
} {
	return {
		staticOrigins: [...DEFAULT_ALLOWED_ORIGINS],
		vercelPattern: 'https://*.vercel.app (hostname ends with .vercel.app)',
		envOrigins: parseEnvOrigins(),
	}
}
