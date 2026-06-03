export type UserRole = 'admin' | 'owner' | 'customer'

export interface UserContext {
	id: number
	role: UserRole
	username: string
	email: string
}
