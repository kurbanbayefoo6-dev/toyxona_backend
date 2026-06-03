import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { BookingsService } from './bookings.service'
import {
	BookingFilters,
	CreateBookingRequestBody,
	DeleteBookingRequestBody,
	UpdateBookingRequestBody,
} from './bookings.types'

export class BookingsController {
	constructor(private readonly bookingsService: BookingsService) {}

	public create = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			if (user.role !== 'customer')
				throw new AppError('Only customers can create bookings', 403)
			const booking = await this.bookingsService.createBooking(
				user.id,
				'customer',
				req.body,
			)
			sendSuccess(res, 201, 'Booking created successfully', booking)
		} catch (error) {
			next(error)
		}
	}

	public list = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const filters = this.parseFilters(req.query)
			const bookings = await this.bookingsService.listBookings(
				user.role,
				user.id,
				filters,
			)
			sendSuccess(res, 200, 'Bookings fetched successfully', bookings)
		} catch (error) {
			next(error)
		}
	}

	public update = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			const booking = await this.bookingsService.updateBooking(
				user.role,
				user.id,
				req.body,
			)
			sendSuccess(res, 200, 'Booking updated successfully', booking)
		} catch (error) {
			next(error)
		}
	}

	public delete = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			if (user.role !== 'admin') throw new AppError('Forbidden', 403)
			await this.bookingsService.deleteBooking(user.role, req.body)
			sendSuccess(res, 200, 'Booking deleted successfully')
		} catch (error) {
			next(error)
		}
	}

	private parseFilters(query: Request['query']): BookingFilters {
		const toNumber = (value: unknown): number | undefined => {
			if (value === undefined) return undefined
			const parsed = Number(value)
			return Number.isNaN(parsed) ? undefined : parsed
		}
		return {
			search: typeof query.search === 'string' ? query.search : undefined,
			status:
				typeof query.status === 'string'
					? (query.status as BookingFilters['status'])
					: undefined,
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
