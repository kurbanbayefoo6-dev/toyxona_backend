import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { SingersService } from './singers.service'
import {
	CreateSingerRequestBody,
	UpdateSingerRequestBody,
} from './singers.types'

export class SingersController {
	constructor(private readonly singersService: SingersService) {}

	public create = async (
		req: Request<unknown, unknown, CreateSingerRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			const singer = await this.singersService.create(
				user.id,
				role,
				req.body,
			)
			sendSuccess(res, 201, 'Singer created successfully', singer)
		} catch (error) {
			next(error)
		}
	}
	public getAll = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const venueId = req.query.venueId ? Number(req.query.venueId) : undefined
			const user = getUserFromRequest(req)
			const singers = await this.singersService.getAll(
				user?.role,
				user?.id,
				venueId,
			)
			sendSuccess(res, 200, 'Singers fetched successfully', singers)
		} catch (error) {
			next(error)
		}
	}
	public getById = async (
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Number(req.params.id)
			if (Number.isNaN(id)) throw new AppError('Invalid singer id', 400)
			const user = getUserFromRequest(req)
			const singer = await this.singersService.getById(
				user?.role,
				user?.id,
				id,
			)
			sendSuccess(res, 200, 'Singer fetched successfully', singer)
		} catch (error) {
			next(error)
		}
	}
	public update = async (
		req: Request<{ id: string }, unknown, UpdateSingerRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const id = Number(req.params.id)
			if (Number.isNaN(id)) throw new AppError('Invalid singer id', 400)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			const singer = await this.singersService.update(
				user.id,
				role,
				id,
				req.body,
			)
			sendSuccess(res, 200, 'Singer updated successfully', singer)
		} catch (error) {
			next(error)
		}
	}
	public delete = async (
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const id = Number(req.params.id)
			if (Number.isNaN(id)) throw new AppError('Invalid singer id', 400)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			await this.singersService.delete(user.id, role, id)
			sendSuccess(res, 200, 'Singer deleted successfully')
		} catch (error) {
			next(error)
		}
	}
}
