export interface EmailOptions {
	to: string
	subject: string
	text?: string
	html?: string
}

export interface SendOtpEmailOptions {
	email: string
	otpCode: string
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
	console.log('=== MOCK EMAIL SERVICE ===')
	console.log(`To: ${options.to}`)
	console.log(`Subject: ${options.subject}`)
	console.log(`Text: ${options.text}`)
	console.log(`HTML: ${options.html}`)
	console.log('========================')
}

export const sendOtpEmail = async (
	options: SendOtpEmailOptions,
): Promise<void> => {
	const emailText = `Your OTP code is: ${options.otpCode}\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.`
	
	await sendEmail({
		to: options.email,
		subject: 'Your OTP Code',
		text: emailText,
	})
}

export const sendPasswordResetEmail = async (
	email: string,
	resetToken: string,
): Promise<void> => {
	const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
	const emailText = `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this email.`
	
	await sendEmail({
		to: email,
		subject: 'Password Reset Request',
		text: emailText,
	})
}
