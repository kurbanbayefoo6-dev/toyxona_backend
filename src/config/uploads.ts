import fs from 'fs'
import path from 'path'

/** Project-root uploads dir (stable regardless of process.cwd()). */
export const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads')

export function ensureUploadsDir(): void {
	if (!fs.existsSync(UPLOADS_DIR)) {
		fs.mkdirSync(UPLOADS_DIR, { recursive: true })
	}
}

export function toPublicUploadPath(filePath: string): string {
	const relative = path.relative(UPLOADS_DIR, filePath)
	if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
		const filename = path.basename(filePath)
		return `/uploads/${filename}`
	}

	return `/uploads/${relative.split(path.sep).join('/')}`
}

export function resolveUploadFilePath(storedUrl: string): string | null {
	const trimmed = storedUrl.trim()
	if (
		!trimmed ||
		trimmed.startsWith('http://') ||
		trimmed.startsWith('https://')
	) {
		return null
	}

	const withoutPrefix = trimmed.replace(/^\/+/, '').replace(/^uploads\//, '')
	const basename = path.basename(withoutPrefix)
	if (!basename || basename === '.' || basename === '..') {
		return null
	}

	return path.join(UPLOADS_DIR, basename)
}
