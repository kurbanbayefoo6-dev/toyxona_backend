/**
 * Prints Cross-Origin-* headers for GET /uploads/<file>.
 * Usage: node scripts/verify-upload-corp-headers.js [baseUrl] [filename]
 */
require('dotenv').config()
const fs = require('fs')
const path = require('path')

const BASE_URL = (process.argv[2] || `http://127.0.0.1:${process.env.PORT || 5000}`).replace(
	/\/$/,
	'',
)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

async function main() {
	const argFile = process.argv[3]
	const files = fs
		.readdirSync(UPLOADS_DIR)
		.filter(f => f !== '.gitkeep' && !f.startsWith('.'))
	const filename = argFile || files[0]

	if (!filename) {
		console.error('No files in uploads/. Pass a filename as 2nd argument.')
		process.exit(1)
	}

	const url = `${BASE_URL}/uploads/${filename}`
	const res = await fetch(url, { method: 'GET' })

	console.log('URL:', url)
	console.log('HTTP status:', res.status)
	console.log('Cross-Origin-Resource-Policy:', res.headers.get('cross-origin-resource-policy'))
	console.log('Cross-Origin-Embedder-Policy:', res.headers.get('cross-origin-embedder-policy'))
	console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'))

	if (res.status !== 200) {
		process.exit(1)
	}

	const corp = res.headers.get('cross-origin-resource-policy')
	if (corp !== 'cross-origin') {
		console.error('Expected Cross-Origin-Resource-Policy: cross-origin, got:', corp)
		process.exit(1)
	}

	console.log('VERIFY_UPLOAD_CORP_OK')
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
