import { NextFunction, Request, Response } from 'express'



import type { UserContext } from '../types/user-context'

import { coerceId } from '../utils/coerceId'
import { verifyAccessToken } from '../utils/jwt'

import { AppError } from './error.middleware'



export const authenticate = (

	req: Request,

	_res: Response,

	next: NextFunction,

): void => {

	try {

		const authHeader = req.headers.authorization



		if (!authHeader || !authHeader.startsWith('Bearer ')) {

			throw new AppError('Unauthorized', 401)

		}


		
		const token = authHeader.slice(7)

		const payload = verifyAccessToken(token)



		const userId = coerceId(payload.userId)
		if (!userId) {
			throw new AppError('Invalid or expired token', 401)
		}

		const user: UserContext = {

			id: userId,

			role: payload.role,

			username: payload.username,

			email: payload.email,

		}



		req.user = user

		next()

	} catch (error) {

		next(error)

	}

}

