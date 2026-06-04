/** Normalize DB/JWT ids that may arrive as string (pg BIGINT) or number. */
export function coerceId(value: unknown): number {
	const id = Number(value)
	if (!Number.isFinite(id) || id <= 0) {
		return 0
	}
	return id
}

export function idsEqual(a: unknown, b: unknown): boolean {
	return coerceId(a) === coerceId(b)
}
