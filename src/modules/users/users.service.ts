import { AppError } from '../../middleware/error.middleware'
import { comparePassword, hashPassword } from '../../utils/bcrypt'
import { UsersRepository } from './users.repository'
import {
	ChangePasswordRequestBody,
	CreateUserByAdminRequestBody,
	SafeUser,
	UpdateSelfRequestBody,
	UpdateUserByAdminRequestBody,
	UserEntity,
	UserRole,
} from './users.types'

export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	public async getMe(userId: number): Promise<SafeUser> {
		const user = await this.usersRepository.findById(userId)
		if (!user) {
			throw new AppError('User not found', 404)
		}

		return this.toSafeUser(user)
	}

	public async getAllUsers(requesterRole: UserRole): Promise<SafeUser[]> {
		if (requesterRole !== 'admin') {
			throw new AppError('Forbidden', 403)
		}

		const users = await this.usersRepository.listAll()
		return users.map(user => this.toSafeUser(user))
	}

	public async createByAdmin(
		requesterRole: UserRole,
		payload: CreateUserByAdminRequestBody,
	): Promise<SafeUser> {
		if (requesterRole !== 'admin') {
			throw new AppError('Forbidden', 403)
		}

		const required = [
			payload.firstName,
			payload.lastName,
			payload.username,
			payload.email,
			payload.password,
			payload.role,
		]
		if (required.some(value => !value || value.trim().length === 0)) {
			throw new AppError('All fields are required', 400)
		}
		if (!['admin', 'owner', 'customer'].includes(payload.role)) {
			throw new AppError('Invalid role', 400)
		}
		if (payload.password.length < 6) {
			throw new AppError('Password must be at least 6 characters', 400)
		}

		const [existingEmail, existingUsername] = await Promise.all([
			this.usersRepository.findByEmail(payload.email),
			this.usersRepository.findByUsername(payload.username),
		])
		if (existingEmail) throw new AppError('Email already exists', 409)
		if (existingUsername) throw new AppError('Username already exists', 409)

		const passwordHash = await hashPassword(payload.password)
		const user = await this.usersRepository.createByAdmin(
			payload,
			passwordHash,
		)
		return this.toSafeUser(user)
	}

	public async updateMe(
		userId: number,
		payload: UpdateSelfRequestBody,
	): Promise<SafeUser> {
		const updatedUser = await this.usersRepository.updateSelf(userId, payload)
		if (!updatedUser) {
			throw new AppError('User not found', 404)
		}

		return this.toSafeUser(updatedUser)
	}

	public async deleteMe(userId: number): Promise<void> {
		const deleted = await this.usersRepository.deleteById(userId)
		if (!deleted) {
			throw new AppError('User not found', 404)
		}
	}

	public async updateByAdmin(
		requesterRole: UserRole,
		targetUserId: number,
		payload: UpdateUserByAdminRequestBody,
	): Promise<SafeUser> {
		if (requesterRole !== 'admin') {
			throw new AppError('Forbidden', 403)
		}

		const updatedUser = await this.usersRepository.updateByAdmin(
			targetUserId,
			payload,
		)
		if (!updatedUser) {
			throw new AppError('User not found', 404)
		}

		return this.toSafeUser(updatedUser)
	}

	public async deleteByAdmin(
		requesterRole: UserRole,
		targetUserId: number,
	): Promise<void> {
		if (requesterRole !== 'admin') {
			throw new AppError('Forbidden', 403)
		}

		const deleted = await this.usersRepository.deleteById(targetUserId)
		if (!deleted) {
			throw new AppError('User not found', 404)
		}
	}

	public async changePassword(
		userId: number,
		payload: ChangePasswordRequestBody,
	): Promise<{ message: string }> {
		if (!payload.currentPassword || !payload.newPassword) {
			throw new AppError('Current password and new password are required', 400)
		}

		if (payload.newPassword.length < 6) {
			throw new AppError('New password must be at least 6 characters', 400)
		}

		if (payload.currentPassword === payload.newPassword) {
			throw new AppError('New password must be different from current password', 400)
		}

		const currentPasswordHash =
			await this.usersRepository.getUserPasswordHash(userId)
		if (!currentPasswordHash) {
			throw new AppError('User not found', 404)
		}

		const isPasswordValid = await comparePassword(
			payload.currentPassword,
			currentPasswordHash,
		)
		if (!isPasswordValid) {
			throw new AppError('Current password is incorrect', 401)
		}

		const newPasswordHash = await hashPassword(payload.newPassword)
		await this.usersRepository.updateUserPassword(userId, newPasswordHash)

		return { message: 'Password changed successfully' }
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
