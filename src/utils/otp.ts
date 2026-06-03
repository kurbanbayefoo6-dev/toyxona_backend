export const generateOtpCode = (): string => {
	return Math.floor(100000 + Math.random() * 900000).toString()
}

export const generateOtpExpiry = (minutes = 10): Date => {
	const expiresAt = new Date()
	expiresAt.setMinutes(expiresAt.getMinutes() + minutes)
	return expiresAt
}
