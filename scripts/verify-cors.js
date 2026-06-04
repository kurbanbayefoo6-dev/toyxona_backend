/**
 * Verifies Access-Control-Allow-Origin for a browser-like request.
 * Usage: node scripts/verify-cors.js [apiBase] [origin]
 */
const API_BASE =
	process.argv[2]?.replace(/\/$/, '') ??
	'https://toyxona-backend-1.onrender.com'
const ORIGIN = process.argv[3] ?? 'http://localhost:5173'

async function check(method) {
	const res = await fetch(`${API_BASE}/api/venues?page=1&limit=1`, {
		method,
		headers: {
			Origin: ORIGIN,
			...(method === 'GET' ? {} : { 'Content-Type': 'application/json' }),
		},
	})

	return {
		method,
		status: res.status,
		allowOrigin: res.headers.get('access-control-allow-origin'),
		allowCredentials: res.headers.get('access-control-allow-credentials'),
	}
}

async function main() {
	console.log('API_BASE:', API_BASE)
	console.log('Origin:', ORIGIN)

	const preflight = await fetch(`${API_BASE}/api/venues`, {
		method: 'OPTIONS',
		headers: {
			Origin: ORIGIN,
			'Access-Control-Request-Method': 'GET',
			'Access-Control-Request-Headers': 'authorization,content-type',
		},
	})

	console.log('OPTIONS status:', preflight.status)
	console.log(
		'OPTIONS Access-Control-Allow-Origin:',
		preflight.headers.get('access-control-allow-origin'),
	)
	console.log(
		'OPTIONS Access-Control-Allow-Credentials:',
		preflight.headers.get('access-control-allow-credentials'),
	)

	const get = await check('GET')
	console.log('GET:', get)

	if (
		get.allowOrigin !== ORIGIN ||
		get.allowCredentials !== 'true'
	) {
		console.error('CORS headers missing or incorrect on GET')
		process.exit(1)
	}

	console.log('VERIFY_CORS_OK')
}

main().catch(error => {
	console.error(error)
	process.exit(1)
})
