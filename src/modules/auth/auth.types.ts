export type UserRole = 'admin' | 'owner' | 'customer'

export interface UserEntity {
	id: number
	first_name: string
	last_name: string
	username: string
	email: string
	phone: string
	password_hash: string
	role: UserRole
	is_verified: boolean
	created_at: Date
}

export interface SafeUser {
	id: number
	firstName: string
	lastName: string
	username: string
	email: string
	phone: string
	role: UserRole
	isVerified: boolean
	createdAt: Date
}

export interface OtpVerificationEntity {
	id: number
	user_id: number
	email: string
	otp_code: string
	expires_at: Date
	is_used: boolean
	created_at: Date
}

export interface RegisterRequestBody {
	firstName: string
	lastName: string
	username: string
	email: string
	phone: string
	password: string
}

export interface VerifyOtpRequestBody {
	email: string
	otpCode: string
}

export interface ResendOtpRequestBody {
	email: string
}

export interface LoginRequestBody {
	identifier: string
	password: string
}

export interface AuthSuccessPayload {
	accessToken: string
	user: SafeUser
}

export interface RegisterSuccessPayload {
	user: SafeUser
	otpCode?: string
	emailSent?: boolean
	emailError?: string
}

export interface ForgotPasswordRequestBody {
	email: string
}

export interface ResetPasswordRequestBody {
	token: string
	newPassword: string
}

export interface PasswordResetTokenEntity {
	id: number
	user_id: number
	token: string
	expires_at: Date
	is_used: boolean
	created_at: Date
}
