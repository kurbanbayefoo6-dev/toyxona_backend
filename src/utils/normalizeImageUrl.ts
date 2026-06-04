/**
 * Normalize stored image paths for API responses.
 * - Absolute URLs are returned unchanged.
 * - Paths starting with / are returned unchanged.
 * - Bare filenames (e.g. diamond1.jpg) become /uploads/<filename>.
 */
export function normalizeStoredImageUrl(
	url: string | null | undefined,
): string | null {
	if (!url || url.trim().length === 0) {
		return null
	}

	const trimmed = url.trim()
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
		return trimmed
	}

	if (trimmed.startsWith('/')) {
		return trimmed
	}

	return `/uploads/${trimmed.replace(/^\/+/, '')}`
}
