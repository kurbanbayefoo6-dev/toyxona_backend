import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { CarsService } from './cars.service'
import { CreateCarRequestBody, UpdateCarRequestBody } from './cars.types'

export class CarsController {
	constructor(private readonly carsService: CarsService) {}
	public create = async (
		req: Request<unknown, unknown, CreateCarRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			const car = await this.carsService.create(user.id, role, req.body)
			sendSuccess(res, 201, 'Car created successfully', car)
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
			const cars = await this.carsService.getAll(
				user?.role,
				user?.id,
				venueId,
			)
			sendSuccess(res, 200, 'Cars fetched successfully', cars)
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
			if (Number.isNaN(id)) throw new AppError('Invalid car id', 400)
			const user = getUserFromRequest(req)
			const car = await this.carsService.getById(
				user?.role,
				user?.id,
				id,
			)
			sendSuccess(res, 200, 'Car fetched successfully', car)
		} catch (error) {
			next(error)
		}
	}
	public update = async (
		req: Request<{ id: string }, unknown, UpdateCarRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const id = Number(req.params.id)
			if (Number.isNaN(id)) throw new AppError('Invalid car id', 400)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			const car = await this.carsService.update(user.id, role, id, req.body)
			sendSuccess(res, 200, 'Car updated successfully', car)
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
			if (Number.isNaN(id)) throw new AppError('Invalid car id', 400)
			const role = user.role === 'admin' ? 'admin' : 'owner'
			await this.carsService.delete(user.id, role, id)
			sendSuccess(res, 200, 'Car deleted successfully')
		} catch (error) {
			next(error)
		}
	}
}
