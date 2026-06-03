import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { AdminService } from './admin.service'
import { AdminQueryFilters } from './admin.types'

export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	public dashboard = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const data = await this.adminService.getDashboard(
				user.role as 'admin',
			)
			sendSuccess(res, 200, 'Dashboard fetched successfully', data)
		} catch (error) {
			next(error)
		}
	}

	public users = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const data = await this.adminService.listUsers(
				user.role as 'admin',
				this.parseFilters(req.query),
			)
			sendSuccess(res, 200, 'Users fetched successfully', data)
		} catch (error) {
			next(error)
		}
	}

	public owners = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const data = await this.adminService.listOwners(
				user.role as 'admin',
				this.parseFilters(req.query),
			)
			sendSuccess(res, 200, 'Owners fetched successfully', data)
		} catch (error) {
			next(error)
		}
	}

	public venues = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const filters = this.parseFilters(req.query)
			filters.status =
				typeof req.query.status === 'string' ? req.query.status : undefined
			const data = await this.adminService.listVenues(
				user.role as 'admin',
				filters,
			)
			sendSuccess(res, 200, 'Venues fetched successfully', data)
		} catch (error) {
			next(error)
		}
	}

	public bookings = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const filters = this.parseFilters(req.query)
			filters.status =
				typeof req.query.status === 'string' ? req.query.status : undefined
			const data = await this.adminService.listBookings(
				user.role as 'admin',
				filters,
			)
			sendSuccess(res, 200, 'Bookings fetched successfully', data)
		} catch (error) {
			next(error)
		}
	}

	private parseFilters(query: Request['query']): AdminQueryFilters {
		const toNumber = (value: unknown): number | undefined => {
			if (value === undefined) return undefined
			const parsed = Number(value)
			return Number.isNaN(parsed) ? undefined : parsed
		}
		return {
			search: typeof query.search === 'string' ? query.search : undefined,
			page: toNumber(query.page),
			limit: toNumber(query.limit),
			sortBy: typeof query.sortBy === 'string' ? query.sortBy : undefined,
			sortOrder:
				query.sortOrder === 'asc'
					? 'asc'
					: query.sortOrder === 'desc'
						? 'desc'
						: undefined,
		}
	}
}
