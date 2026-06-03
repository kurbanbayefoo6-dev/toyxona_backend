import type { UserContext } from './user-context'

declare global {
	namespace Express {
		interface Request {
			user?: UserContext
		}
	}
}

export {}
