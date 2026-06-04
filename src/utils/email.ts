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

const DEFAULT_EMAIL_FROM = 'Toyxona <onboarding@resend.dev>'
const emailFrom = process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM

if (!process.env.EMAIL_FROM) {
	console.warn(
		`EMAIL_FROM is not configured. Falling back to '${DEFAULT_EMAIL_FROM}'. ` +
			'onboarding@resend.dev only delivers to the Resend account owner; set EMAIL_FROM to a verified domain sender for production delivery.',
	)
}

const resend = resendApiKey ? new Resend(resendApiKey) : null

export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; error?: string; data?: unknown }> => {
	if (!resend) {
		console.error('Resend is not configured. Cannot send email.')
		return { success: false, error: 'Email service not configured' }
	}

	try {
		console.log('[EMAIL] Sending email:', {
			to: options.to,
			from: emailFrom,
			subject: options.subject,
		})
		const { data, error } = await resend.emails.send({
			from: emailFrom,
			to: options.to,
			subject: options.subject,
			text: options.text || '',
			html: options.html || undefined,
		})

		if (error) {
			console.error('[EMAIL] Resend returned an error:', {
				to: options.to,
				from: emailFrom,
				subject: options.subject,
				errorName: error.name,
				errorMessage: error.message,
			})
			return { success: false, error: error.message, data: { error } }
		}

		console.log('[EMAIL] Email sent successfully:', {
			to: options.to,
			from: emailFrom,
			subject: options.subject,
			resendId: data?.id,
		})
		return { success: true, data }
	} catch (error) {
		console.error('[EMAIL] Failed to send email:', {
			to: options.to,
			from: emailFrom,
			subject: options.subject,
			error,
		})
		return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
	}
}

export const sendOtpEmail = async (
	options: SendOtpEmailOptions,
): Promise<{ success: boolean; error?: string; data?: unknown }> => {
	console.log('[OTP] Sending OTP email:', {
		email: options.email,
		otpCode: options.otpCode,
	})
	const emailText = `Your OTP code is: ${options.otpCode}\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.`
	
	return sendEmail({
		to: options.email,
		subject: 'Your OTP Code',
		text: emailText,
	})
}

export const sendPasswordResetEmail = async (
	email: string,
	resetToken: string,
): Promise<{ success: boolean; error?: string; data?: unknown }> => {
	console.log('[PASSWORD RESET] Sending password reset email:', { email })
	const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
	const emailText = `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this email.`
	
	return sendEmail({
		to: email,
		subject: 'Password Reset Request',
		text: emailText,
	})
}
