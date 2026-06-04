import { Resend } from 'resend'

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

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
	console.warn('RESEND_API_KEY is not configured. Email sending will fail.')
}

const resend = resendApiKey ? new Resend(resendApiKey) : null

export const sendEmail = async (options: EmailOptions): Promise<void> => {
	if (!resend) {
		console.error('Resend is not configured. Cannot send email.')
		throw new Error('Email service not configured')
	}

	try {
		await resend.emails.send({
			from: 'Toyxona <onboarding@resend.dev>',
			to: options.to,
			subject: options.subject,
			text: options.text || '',
			html: options.html || undefined,
		})
	} catch (error) {
		console.error('Failed to send email:', error)
		throw new Error('Failed to send email')
	}
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
	const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
	const emailText = `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this email.`
	
	await sendEmail({
		to: email,
		subject: 'Password Reset Request',
		text: emailText,
	})
}
