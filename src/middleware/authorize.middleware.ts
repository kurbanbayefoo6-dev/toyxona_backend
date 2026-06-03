import { NextFunction, Request, Response } from 'express'

import type { UserRole } from '../types/user-context'
import { getUserFromRequest } from '../utils/request'
import { AppError } from './error.middleware'

export const authorize = (...roles: UserRole[]) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			if (!roles.includes(user.role)) {
				throw new AppError('Forbidden', 403)
			}

			next()
		} catch (error) {
			next(error)
		}
	}
}
