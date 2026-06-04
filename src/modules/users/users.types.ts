export type UserRole = 'admin' | 'owner' | 'customer'

export interface UserEntity {
	id: number
	first_name: string
	last_name: string
	username: string
	email: string
	phone: string
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

export interface UpdateSelfRequestBody {
	firstName?: string
	lastName?: string
	phone?: string
}

export interface UpdateUserByAdminRequestBody {
	firstName?: string
	lastName?: string
	phone?: string
	role?: UserRole
	isVerified?: boolean
}

export interface CreateUserByAdminRequestBody {
	firstName: string
	lastName: string
	username: string
	email: string
	phone?: string
	password: string
	role: UserRole
	isVerified?: boolean
}

export interface ChangePasswordRequestBody {
	currentPassword: string
	newPassword: string
}
