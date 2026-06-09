import crypto from 'crypto'
import path from 'path'

import { AppError } from '../middleware/error.middleware'

type CloudinaryUploadResponse = {
	secure_url?: string
	url?: string
	public_id?: string
	error?: { message?: string }
}

type CloudinaryDestroyResponse = {
	result?: string
	error?: { message?: string }
}

function getCloudinaryConfig(): {
	cloudName: string
	apiKey: string
	apiSecret: string
	folder: string
} {
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME
	const apiKey = process.env.CLOUDINARY_API_KEY
	const apiSecret = process.env.CLOUDINARY_API_SECRET
	const folder = process.env.CLOUDINARY_FOLDER || 'wedding-hall'

	if (!cloudName || !apiKey || !apiSecret) {
		throw new AppError(
			'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET',
			500,
		)
	}

	return { cloudName, apiKey, apiSecret, folder }
}

function signParams(
	params: Record<string, string | number | undefined>,
	apiSecret: string,
): string {
	const payload = Object.entries(params)
		.filter(([, value]) => value !== undefined && value !== '')
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => `${key}=${value}`)
		.join('&')

	return crypto
		.createHash('sha1')
		.update(`${payload}${apiSecret}`)
		.digest('hex')
}

function buildPublicId(file: Express.Multer.File): string {
	const extension = path.extname(file.originalname)
	const basename =
		path
			.basename(file.originalname, extension)
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'image'
	const suffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`

	return `${basename}-${suffix}`
}

export async function uploadImageToCloudinary(
	file: Express.Multer.File,
): Promise<string> {
	if (!file.buffer || file.buffer.length === 0) {
		throw new AppError('Image file is empty', 400)
	}

	const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig()
	const timestamp = Math.floor(Date.now() / 1000)
	const publicId = buildPublicId(file)
	const signature = signParams(
		{ folder, public_id: publicId, timestamp },
		apiSecret,
	)
	const form = new FormData()
	const arrayBuffer = new ArrayBuffer(file.buffer.length)
	new Uint8Array(arrayBuffer).set(file.buffer)
	const blob = new Blob([arrayBuffer], {
		type: file.mimetype || 'application/octet-stream',
	})

	form.append('file', blob, file.originalname || `${publicId}.jpg`)
	form.append('api_key', apiKey)
	form.append('timestamp', String(timestamp))
	form.append('folder', folder)
	form.append('public_id', publicId)
	form.append('signature', signature)

	const response = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
		{ method: 'POST', body: form },
	)
	const body = (await response.json()) as CloudinaryUploadResponse

	if (!response.ok || (!body.secure_url && !body.url)) {
		throw new AppError(
			body.error?.message || 'Cloudinary image upload failed',
			502,
		)
	}

	return body.secure_url || body.url!
}

function extractCloudinaryPublicId(imageUrl: string): string | null {
	try {
		const { cloudName } = getCloudinaryConfig()
		const url = new URL(imageUrl)
		if (!url.hostname.includes('cloudinary.com')) return null
		if (!url.pathname.includes(`/${cloudName}/image/upload/`)) return null

		const marker = `/${cloudName}/image/upload/`
		const afterUpload = url.pathname.split(marker)[1]
		if (!afterUpload) return null

		const withoutVersion = afterUpload.replace(/^v\d+\//, '')
		const parsed = path.posix.parse(withoutVersion)
		return path.posix.join(parsed.dir, parsed.name)
	} catch {
		return null
	}
}

export async function deleteCloudinaryImageByUrl(
	imageUrl: string,
): Promise<void> {
	const publicId = extractCloudinaryPublicId(imageUrl)
	if (!publicId) return

	const { cloudName, apiKey, apiSecret } = getCloudinaryConfig()
	const timestamp = Math.floor(Date.now() / 1000)
	const signature = signParams({ public_id: publicId, timestamp }, apiSecret)
	const form = new FormData()

	form.append('public_id', publicId)
	form.append('api_key', apiKey)
	form.append('timestamp', String(timestamp))
	form.append('signature', signature)

	const response = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
		{ method: 'POST', body: form },
	)

	if (!response.ok) {
		const body = (await response.json().catch(() => null)) as
			| CloudinaryDestroyResponse
			| null
		throw new AppError(
			body?.error?.message || 'Cloudinary image delete failed',
			502,
		)
	}
}
