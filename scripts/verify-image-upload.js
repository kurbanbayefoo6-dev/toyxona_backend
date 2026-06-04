/**
 * Verifies venue image upload + static serving.
 * Usage: node scripts/verify-image-upload.js [baseUrl]
 */
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { UPLOADS_DIR, ensureUploadsDir } = require('../dist/config/uploads')

const BASE_URL = process.argv[2] || `http://127.0.0.1:${process.env.PORT || 5000}`
const ADMIN_IDENTIFIER = process.env.ADMIN_IDENTIFIER || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

const PNG_BASE64 =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function request(url, options = {}) {
	const response = await fetch(url, options)
	const text = await response.text()
	let body
	try {
		body = JSON.parse(text)
	} catch {
		body = text
	}
	return { status: response.status, body }
}

async function main() {
	ensureUploadsDir()

	const beforeFiles = fs.readdirSync(UPLOADS_DIR).filter(f => f !== '.gitkeep')
	console.log('UPLOADS_DIR:', UPLOADS_DIR)
	console.log('Files before upload:', beforeFiles.length ? beforeFiles : '(none)')

	const login = await request(`${BASE_URL}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			identifier: ADMIN_IDENTIFIER,
			password: ADMIN_PASSWORD,
		}),
	})

	if (login.status !== 200 || !login.body?.data?.accessToken) {
		console.error('Login failed:', login.status, login.body)
		process.exit(1)
	}

	const token = login.body.data.accessToken
	const venues = await request(`${BASE_URL}/api/venues/`, {
		headers: { Authorization: `Bearer ${token}` },
	})

	const data = venues.body?.data
	const venueList = Array.isArray(data)
		? data
		: data?.items || data?.venues || []
	const firstVenue = venueList[0]
	const venueId = firstVenue?.id != null ? Number(firstVenue.id) : null
	if (!venueId) {
		console.error('No venue found for upload test. Create a venue first.')
		process.exit(1)
	}

	const pngBuffer = Buffer.from(PNG_BASE64, 'base64')
	const form = new FormData()
	form.append(
		'image',
		new Blob([pngBuffer], { type: 'image/png' }),
		'verify-upload-test.png',
	)

	const upload = await request(`${BASE_URL}/api/venues/${venueId}/images`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: form,
	})

	if (upload.status !== 201) {
		console.error('Upload failed:', upload.status, upload.body)
		process.exit(1)
	}

	const imageUrl = upload.body?.data?.imageUrl
	if (!imageUrl) {
		console.error('Upload response missing imageUrl:', upload.body)
		process.exit(1)
	}

	const filename = path.basename(imageUrl)
	const diskPath = path.join(UPLOADS_DIR, filename)
	const afterFiles = fs.readdirSync(UPLOADS_DIR).filter(f => f !== '.gitkeep')

	console.log('Upload response imageUrl:', imageUrl)
	console.log('Expected disk path:', diskPath)
	console.log('File on disk:', fs.existsSync(diskPath) ? 'YES' : 'NO')
	console.log('Files after upload:', afterFiles)

	const staticUrl = `${BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
	const staticRes = await fetch(staticUrl)
	const staticBody = await staticRes.arrayBuffer()

	console.log('Static URL:', staticUrl)
	console.log('Static HTTP status:', staticRes.status)
	console.log('Static bytes:', staticBody.byteLength)

	if (!fs.existsSync(diskPath) || staticRes.status !== 200) {
		process.exit(1)
	}

	console.log('VERIFY_IMAGE_UPLOAD_OK')
}

main().catch(error => {
	console.error(error)
	process.exit(1)
})
