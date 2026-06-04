import { AppError } from '../../middleware/error.middleware'
import { comparePassword, hashPassword } from '../../utils/bcrypt'
import { coerceId } from '../../utils/coerceId'
import { signAccessToken } from '../../utils/jwt'
import { generateOtpExpiry } from '../../utils/otp'
import { AuthRepository } from './auth.repository'
import {
	AuthSuccessPayload,
	ForgotPasswordRequestBody,
	LoginRequestBody,
	RegisterRequestBody,
	RegisterSuccessPayload,
	ResendOtpRequestBody,
	ResetPasswordRequestBody,
	SafeUser,
	UserEntity,
	UserRole,
	VerifyOtpRequestBody,
} from './auth.types'
import crypto from 'crypto'

// Demo/testing: OTP delivery is not finalized, so use a fixed code.
const DEMO_OTP_CODE = '111111'

export class AuthService {
	constructor(private readonly authRepository: AuthRepository) {}

	public async registerCustomer(
		payload: RegisterRequestBody,
	): Promise<RegisterSuccessPayload> {
		return this.register(payload, 'customer')
	}

	public async registerOwner(
		payload: RegisterRequestBody,
	): Promise<RegisterSuccessPayload> {
		return this.register(payload, 'owner')
	}

	public async verifyOtp(
		payload: VerifyOtpRequestBody,
	): Promise<AuthSuccessPayload> {
		if (!payload.email || !payload.otpCode) {
			throw new AppError('Email and otpCode are required', 400)
		}

		console.log('[OTP] Verifying OTP:', {
			email: payload.email,
			otpCode: payload.otpCode,
		})

		// Demo fixed code is always accepted; 123456 dev fallback kept for non-prod.
		const isDevelopment = process.env.NODE_ENV !== 'production'
		const isDemoCode = payload.otpCode === DEMO_OTP_CODE
		const isFallbackCode = isDevelopment && payload.otpCode === '123456'
		const isAccepted = isDemoCode || isFallbackCode

		const otpRecord = await this.authRepository.findValidOtpByEmail(
			payload.email,
			payload.otpCode,
		)

		if (!otpRecord && !isAccepted) {
			console.log('[OTP] Invalid or expired OTP')
			throw new AppError('Invalid or expired OTP', 400)
		}

		const user = await this.authRepository.findUserByEmail(payload.email)
		if (!user) {
			throw new AppError('User not found', 404)
		}

		if (otpRecord) {
			await this.authRepository.markOtpUsed(otpRecord.id)
		}
		await this.authRepository.markUserVerified(user.id)

		const verifiedUser: UserEntity = {
			...user,
			is_verified: true,
		}

		const accessToken = signAccessToken({
			userId: coerceId(verifiedUser.id),
			role: verifiedUser.role,
			username: verifiedUser.username,
			email: verifiedUser.email,
		})

		console.log('[OTP] OTP verified successfully')

		return {
			accessToken,
			user: this.toSafeUser(verifiedUser),
		}
	}

	public async resendOtp(
		payload: ResendOtpRequestBody,
	): Promise<{ email: string; otpCode: string }> {
		if (!payload.email) {
			throw new AppError('Email is required', 400)
		}

		const user = await this.authRepository.findUserByEmail(payload.email)
		if (!user) {
			throw new AppError('User not found', 404)
		}

		if (user.is_verified) {
			throw new AppError('User already verified', 400)
		}

		await this.authRepository.invalidateOtpByEmail(payload.email)

		const otpCode = DEMO_OTP_CODE
		const expiresAt = generateOtpExpiry()

		console.log('[OTP] Generated new OTP:', {
			email: payload.email,
			otpCode,
			expiresAt,
		})

		await this.authRepository.createOtpVerification(
			user.id,
			payload.email,
			otpCode,
			expiresAt,
		)

		return { email: payload.email, otpCode }
	}

	public async login(payload: LoginRequestBody): Promise<AuthSuccessPayload> {
		if (!payload.identifier || !payload.password) {
			throw new AppError('Identifier and password are required', 400)
		}

		const user = await this.authRepository.findUserByIdentifier(
			payload.identifier,
		)
		if (!user) {
			throw new AppError('Invalid credentials', 401)
		}

		const isPasswordValid = await comparePassword(
			payload.password,
			user.password_hash,
		)
		if (!isPasswordValid) {
			throw new AppError('Invalid credentials', 401)
		}

		if (!user.is_verified) {
			throw new AppError('User is not verified', 403)
		}

		const accessToken = signAccessToken({
			userId: coerceId(user.id),
			role: user.role,
			username: user.username,
			email: user.email,
		})

		return {
			accessToken,
			user: this.toSafeUser(user),
		}
	}

	public async logout(): Promise<{ message: string }> {
		return { message: 'Logout successful' }
	}

	public async forgotPassword(
		payload: ForgotPasswordRequestBody,
	): Promise<{ message: string; resetToken: string }> {
		if (!payload.email) {
			throw new AppError('Email is required', 400)
		}

		const user = await this.authRepository.findUserByEmail(payload.email)
		if (!user) {
			throw new AppError('User not found', 404)
		}

		await this.authRepository.invalidatePreviousPasswordResetTokens(user.id)

		const resetToken = crypto.randomBytes(32).toString('hex')
		const expiresAt = new Date()
		expiresAt.setHours(expiresAt.getHours() + 1)

		console.log('[PASSWORD RESET] Generated reset token:', {
			email: payload.email,
			expiresAt,
		})

		await this.authRepository.createPasswordResetToken(
			user.id,
			resetToken,
			expiresAt,
		)

		return {
			message: 'Password reset token generated',
			resetToken,
		}
	}

	public async resetPassword(
		payload: ResetPasswordRequestBody,
	): Promise<{ message: string }> {
		if (!payload.token || !payload.newPassword) {
			throw new AppError('Token and newPassword are required', 400)
		}

		if (payload.newPassword.length < 6) {
			throw new AppError('Password must be at least 6 characters', 400)
		}

		const resetTokenRecord =
			await this.authRepository.findValidPasswordResetToken(payload.token)
		if (!resetTokenRecord) {
			throw new AppError('Invalid or expired reset token', 400)
		}

		const passwordHash = await hashPassword(payload.newPassword)

		await this.authRepository.updateUserPassword(
			resetTokenRecord.user_id,
			passwordHash,
		)
		await this.authRepository.markPasswordResetTokenUsed(resetTokenRecord.id)

		return { message: 'Password reset successful' }
	}

	private async register(
		payload: RegisterRequestBody,
		role: UserRole,
	): Promise<RegisterSuccessPayload> {
		this.validateRegisterPayload(payload)

		const existingEmail = await this.authRepository.findUserByEmail(
			payload.email,
		)
		if (existingEmail) {
			throw new AppError('Email already exists', 409)
		}

		const existingUsername = await this.authRepository.findUserByUsername(
			payload.username,
		)
		if (existingUsername) {
			throw new AppError('Username already exists', 409)
		}

		const passwordHash = await hashPassword(payload.password)
		const createdUser = await this.authRepository.createUser(
			payload,
			passwordHash,
			role,
		)

		const otpCode = DEMO_OTP_CODE
		const expiresAt = generateOtpExpiry()

		console.log('[OTP] Generated OTP for registration:', {
			email: createdUser.email,
			otpCode,
			expiresAt,
		})

		await this.authRepository.createOtpVerification(
			createdUser.id,
			createdUser.email,
			otpCode,
			expiresAt,
		)

		return {
			user: this.toSafeUser(createdUser),
			email: createdUser.email,
			otpCode,
		}
	}

	private validateRegisterPayload(payload: RegisterRequestBody): void {
		const required = [
			payload.firstName,
			payload.lastName,
			payload.username,
			payload.email,
			payload.phone,
			payload.password,
		]

		const hasEmptyValue = required.some(
			value => !value || value.trim().length === 0,
		)
		if (hasEmptyValue) {
			throw new AppError('All fields are required', 400)
		}
	}

	private toSafeUser(user: UserEntity): SafeUser {
		return {
			id: user.id,
			firstName: user.first_name,
			lastName: user.last_name,
			username: user.username,
			email: user.email,
			phone: user.phone,
			role: user.role,
			isVerified: user.is_verified,
			createdAt: user.created_at,
		}
	}
}
