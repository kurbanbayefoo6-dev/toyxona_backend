import jwt from 'jsonwebtoken'

import { AppError } from '../middleware/error.middleware'
import type { UserRole } from '../types/user-context'

export type { UserRole } from '../types/user-context'

export interface JwtPayload {
	userId: number | string
	role: UserRole
	username: string
	email: string
}

const getJwtSecret = (): string => {
	const jwtSecret = process.env.JWT_SECRET

	if (!jwtSecret) {
		throw new AppError('JWT_SECRET is not configured', 500)
	}

	return jwtSecret
}

const isJwtPayload = (decoded: jwt.JwtPayload | string): decoded is JwtPayload => {
	if (typeof decoded === 'string') {
		return false
	}

	return (
		(typeof decoded.userId === 'number' || typeof decoded.userId === 'string') &&
		typeof decoded.role === 'string' &&
		(decoded.role === 'admin' ||
			decoded.role === 'owner' ||
			decoded.role === 'customer') &&
		typeof decoded.username === 'string' &&
		typeof decoded.email === 'string'
	)
}

export const signAccessToken = (payload: JwtPayload): string => {
	const expiresIn = (process.env.JWT_EXPIRES_IN ||
		'7d') as jwt.SignOptions['expiresIn']
	return jwt.sign(payload, getJwtSecret(), { expiresIn })
}

export const verifyAccessToken = (token: string): JwtPayload => {
	try {
		const decoded = jwt.verify(token, getJwtSecret())

		if (!isJwtPayload(decoded)) {
			throw new AppError('Invalid or expired token', 401)
		}

		return decoded
	} catch (error) {
		if (error instanceof AppError) {
			throw error
		}

		throw new AppError('Invalid or expired token', 401)
	}
}
