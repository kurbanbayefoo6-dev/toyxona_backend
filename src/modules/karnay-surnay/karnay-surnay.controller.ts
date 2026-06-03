import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { KarnaySurnayService } from './karnay-surnay.service'
import {
	CreateKarnaySurnayRequestBody,
	UpdateKarnaySurnayRequestBody,
} from './karnay-surnay.types'

export class KarnaySurnayController {
	constructor(private readonly service: KarnaySurnayService) {}
	public create = async (
		req: Request<unknown, unknown, CreateKarnaySurnayRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			const item = await this.service.create(user.id, role, req.body)
			sendSuccess(res, 201, 'Karnay surnay created successfully', item)
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
			const items = await this.service.getAll(
				user?.role,
				user?.id,
				venueId,
			)
			sendSuccess(res, 200, 'Karnay surnay fetched successfully', items)
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
			if (Number.isNaN(id)) throw new AppError('Invalid id', 400)
			const user = getUserFromRequest(req)
			const item = await this.service.getById(user?.role, user?.id, id)
			sendSuccess(res, 200, 'Karnay surnay fetched successfully', item)
		} catch (error) {
			next(error)
		}
	}
	public update = async (
		req: Request<{ id: string }, unknown, UpdateKarnaySurnayRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const id = Number(req.params.id)
			if (Number.isNaN(id)) throw new AppError('Invalid id', 400)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			const item = await this.service.update(user.id, role, id, req.body)
			sendSuccess(res, 200, 'Karnay surnay updated successfully', item)
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
			if (Number.isNaN(id)) throw new AppError('Invalid id', 400)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			await this.service.delete(user.id, role, id)
			sendSuccess(res, 200, 'Karnay surnay deleted successfully')
		} catch (error) {
			next(error)
		}
	}
}
