import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { UsersService } from './users.service'
import {
	ChangePasswordRequestBody,
	CreateUserByAdminRequestBody,
	UpdateSelfRequestBody,
	UpdateUserByAdminRequestBody,
} from './users.types'

export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	public getMe = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			const userData = await this.usersService.getMe(user.id)
			sendSuccess(res, 200, 'User profile fetched', userData)
		} catch (error) {
			next(error)
		}
	}

	public getUsers = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			const users = await this.usersService.getAllUsers(user.role)
			sendSuccess(res, 200, 'Users fetched', users)
		} catch (error) {
			next(error)
		}
	}

	public createByAdmin = async (
		req: Request<unknown, unknown, CreateUserByAdminRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			const createdUser = await this.usersService.createByAdmin(
				user.role,
				req.body,
			)
			sendSuccess(res, 201, 'User created by admin', createdUser)
		} catch (error) {
			next(error)
		}
	}

	public updateMe = async (
		req: Request<unknown, unknown, UpdateSelfRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			const updatedUser = await this.usersService.updateMe(
				user.id,
				req.body,
			)
			sendSuccess(res, 200, 'User updated', updatedUser)
		} catch (error) {
			next(error)
		}
	}

	public deleteMe = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			await this.usersService.deleteMe(user.id)
			sendSuccess(res, 200, 'User deleted')
		} catch (error) {
			next(error)
		}
	}

	public updateByAdmin = async (
		req: Request<{ id: string }, unknown, UpdateUserByAdminRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			const targetUserId = Number(req.params.id)
			if (Number.isNaN(targetUserId)) {
				throw new AppError('Invalid user id', 400)
			}

			const updatedUser = await this.usersService.updateByAdmin(
				user.role,
				targetUserId,
				req.body,
			)
			sendSuccess(res, 200, 'User updated by admin', updatedUser)
		} catch (error) {
			next(error)
		}
	}

	public deleteByAdmin = async (
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			const targetUserId = Number(req.params.id)
			if (Number.isNaN(targetUserId)) {
				throw new AppError('Invalid user id', 400)
			}

			await this.usersService.deleteByAdmin(user.role, targetUserId)
			sendSuccess(res, 200, 'User deleted by admin')
		} catch (error) {
			next(error)
		}
	}

	public changePassword = async (
		req: Request<unknown, unknown, ChangePasswordRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			const result = await this.usersService.changePassword(user.id, req.body)
			sendSuccess(res, 200, result.message)
		} catch (error) {
			next(error)
		}
	}
}
