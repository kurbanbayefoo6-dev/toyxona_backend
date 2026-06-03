import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import {
	OtpVerificationEntity,
	PasswordResetTokenEntity,
	RegisterRequestBody,
	UserEntity,
	UserRole,
} from './auth.types'

export class AuthRepository {
	public async findUserByEmail(email: string): Promise<UserEntity | null> {
		const query = `
      SELECT id, first_name, last_name, username, email, phone, password_hash, role, is_verified, created_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `

		const result: QueryResult<UserEntity> = await pool.query(query, [email])
		return result.rows[0] || null
	}

	public async findUserByUsername(
		username: string,
	): Promise<UserEntity | null> {
		const query = `
      SELECT id, first_name, last_name, username, email, phone, password_hash, role, is_verified, created_at
      FROM users
      WHERE username = $1
      LIMIT 1
    `

		const result: QueryResult<UserEntity> = await pool.query(query, [username])
		return result.rows[0] || null
	}

	public async findUserByIdentifier(
		identifier: string,
	): Promise<UserEntity | null> {
		const query = `
      SELECT id, first_name, last_name, username, email, phone, password_hash, role, is_verified, created_at
      FROM users
      WHERE username = $1 OR email = $1
      LIMIT 1
    `

		const result: QueryResult<UserEntity> = await pool.query(query, [
			identifier,
		])
		return result.rows[0] || null
	}

	public async createUser(
		payload: RegisterRequestBody,
		passwordHash: string,
		role: UserRole,
	): Promise<UserEntity> {
		const query = `
      INSERT INTO users (first_name, last_name, username, email, phone, password_hash, role, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
      RETURNING id, first_name, last_name, username, email, phone, password_hash, role, is_verified, created_at
    `

		const params = [
			payload.firstName,
			payload.lastName,
			payload.username,
			payload.email,
			payload.phone,
			passwordHash,
			role,
		]

		const result: QueryResult<UserEntity> = await pool.query(query, params)
		return result.rows[0]
	}

	public async createOtpVerification(
		userId: number,
		email: string,
		otpCode: string,
		expiresAt: Date,
	): Promise<OtpVerificationEntity> {
		const query = `
      INSERT INTO otp_verifications (user_id, email, otp_code, expires_at, is_used)
      VALUES ($1, $2, $3, $4, FALSE)
      RETURNING id, user_id, email, otp_code, expires_at, is_used, created_at
    `

		const result: QueryResult<OtpVerificationEntity> = await pool.query(query, [
			userId,
			email,
			otpCode,
			expiresAt,
		])

		return result.rows[0]
	}

	public async invalidateOtpByEmail(email: string): Promise<void> {
		const query = `
      UPDATE otp_verifications
      SET is_used = TRUE
      WHERE email = $1 AND is_used = FALSE
    `

		await pool.query(query, [email])
	}

	public async findValidOtpByEmail(
		email: string,
		otpCode: string,
	): Promise<OtpVerificationEntity | null> {
		const query = `
      SELECT id, user_id, email, otp_code, expires_at, is_used, created_at
      FROM otp_verifications
      WHERE email = $1
        AND otp_code = $2
        AND is_used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `

		const result: QueryResult<OtpVerificationEntity> = await pool.query(query, [
			email,
			otpCode,
		])
		return result.rows[0] || null
	}

	public async markOtpUsed(otpId: number): Promise<void> {
		const query = `
      UPDATE otp_verifications
      SET is_used = TRUE
      WHERE id = $1
    `

		await pool.query(query, [otpId])
	}

	public async markUserVerified(userId: number): Promise<void> {
		const query = `
      UPDATE users
      SET is_verified = TRUE
      WHERE id = $1
    `

		await pool.query(query, [userId])
	}

	public async createPasswordResetToken(
		userId: number,
		token: string,
		expiresAt: Date,
	): Promise<PasswordResetTokenEntity> {
		const query = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at, is_used)
      VALUES ($1, $2, $3, FALSE)
      RETURNING id, user_id, token, expires_at, is_used, created_at
    `

		const result: QueryResult<PasswordResetTokenEntity> = await pool.query(
			query,
			[userId, token, expiresAt],
		)
		return result.rows[0]
	}

	public async findValidPasswordResetToken(
		token: string,
	): Promise<PasswordResetTokenEntity | null> {
		const query = `
      SELECT id, user_id, token, expires_at, is_used, created_at
      FROM password_reset_tokens
      WHERE token = $1
        AND is_used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `

		const result: QueryResult<PasswordResetTokenEntity> = await pool.query(
			query,
			[token],
		)
		return result.rows[0] || null
	}

	public async markPasswordResetTokenUsed(tokenId: number): Promise<void> {
		const query = `
      UPDATE password_reset_tokens
      SET is_used = TRUE
      WHERE id = $1
    `

		await pool.query(query, [tokenId])
	}

	public async updateUserPassword(
		userId: number,
		passwordHash: string,
	): Promise<void> {
		const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
    `

		await pool.query(query, [passwordHash, userId])
	}

	public async invalidatePreviousPasswordResetTokens(
		userId: number,
	): Promise<void> {
		const query = `
      UPDATE password_reset_tokens
      SET is_used = TRUE
      WHERE user_id = $1 AND is_used = FALSE
    `

		await pool.query(query, [userId])
	}
}
