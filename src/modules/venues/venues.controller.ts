import { NextFunction, Request, Response } from 'express'



import { AppError } from '../../middleware/error.middleware'

import { sendSuccess } from '../../utils/response'

import { getUserFromRequest } from '../../utils/request'

import { VenuesService } from './venues.service'

import {

	CreateVenueRequestBody,

	UpdateVenueRequestBody,

	UpdateVenueStatusRequestBody,

	VenueFilters,

} from './venues.types'



export class VenuesController {

	constructor(private readonly venuesService: VenuesService) {}



	public createVenue = async (

		req: Request<unknown, unknown, CreateVenueRequestBody>,

		res: Response,

		next: NextFunction,

	): Promise<void> => {

		try {

			const user = getUserFromRequest(req)

			if (!user) {

				throw new AppError('Unauthorized', 401)

			}



			const role = user.role === 'admin' ? 'admin' : 'owner'

			const venue = await this.venuesService.createVenue(

				user.id,

				role,

				req.body,

			)

			sendSuccess(res, 201, 'Venue created successfully', venue)

		} catch (error) {

			next(error)

		}

	}



	public getVenues = async (

		req: Request,

		res: Response,

		next: NextFunction,

	): Promise<void> => {

		try {

			const filters = this.parseFilters(req.query)

			const user = getUserFromRequest(req)

			const userRole = user?.role

			const userId = user?.id

			const data = await this.venuesService.getVenues(userRole, userId, filters)

			sendSuccess(res, 200, 'Venues fetched successfully', data)

		} catch (error) {

			next(error)

		}

	}



	public getVenueById = async (

		req: Request<{ id: string }>,

		res: Response,

		next: NextFunction,

	): Promise<void> => {

		try {

			const venueId = Number(req.params.id)

			if (Number.isNaN(venueId)) {

				throw new AppError('Invalid venue id', 400)

			}



			const user = getUserFromRequest(req)

			const venue = await this.venuesService.getVenueById(

				user?.role,

				user?.id,

				venueId,

			)

			sendSuccess(res, 200, 'Venue fetched successfully', venue)

		} catch (error) {

			next(error)

		}

	}



	public updateVenue = async (

		req: Request<{ id: string }, unknown, UpdateVenueRequestBody>,

		res: Response,

		next: NextFunction,

	): Promise<void> => {

		try {

			const user = getUserFromRequest(req)

			if (!user) {

				throw new AppError('Unauthorized', 401)

			}



			const venueId = Number(req.params.id)

			if (Number.isNaN(venueId)) {

				throw new AppError('Invalid venue id', 400)

			}



			const role = user.role === 'admin' ? 'admin' : 'owner'

			const venue = await this.venuesService.updateVenue(

				role,

				user.id,

				venueId,

				req.body,

			)

			sendSuccess(res, 200, 'Venue updated successfully', venue)

		} catch (error) {

			next(error)

		}

	}



	public deleteVenue = async (

		req: Request<{ id: string }>,

		res: Response,

		next: NextFunction,

	): Promise<void> => {

		try {

			const user = getUserFromRequest(req)

			if (!user) {

				throw new AppError('Unauthorized', 401)

			}



			const venueId = Number(req.params.id)

			if (Number.isNaN(venueId)) {

				throw new AppError('Invalid venue id', 400)

			}



			const role = user.role === 'admin' ? 'admin' : 'owner'

			await this.venuesService.deleteVenue(role, user.id, venueId)

			sendSuccess(res, 200, 'Venue deleted successfully')

		} catch (error) {

			next(error)

		}

	}



	public updateVenueStatus = async (

		req: Request<{ id: string }, unknown, UpdateVenueStatusRequestBody>,

		res: Response,

		next: NextFunction,

	): Promise<void> => {

		try {

			const user = getUserFromRequest(req)

			if (!user) {

				throw new AppError('Unauthorized', 401)

			}



			const venueId = Number(req.params.id)

			if (Number.isNaN(venueId)) {

				throw new AppError('Invalid venue id', 400)

			}



			const venue = await this.venuesService.updateVenueStatus(

				'admin',

				venueId,

				req.body,

			)

			sendSuccess(res, 200, 'Venue status updated successfully', venue)

		} catch (error) {

			next(error)

		}

	}



	public getVenueAvailability = async (

		req: Request<{ id: string }>,

		res: Response,

		next: NextFunction,

	): Promise<void> => {

		try {

			const venueId = Number(req.params.id)

			if (Number.isNaN(venueId)) {

				throw new AppError('Invalid venue id', 400)

			}



			const availability = await this.venuesService.getVenueAvailability(venueId)

			sendSuccess(res, 200, 'Venue availability fetched successfully', availability)

		} catch (error) {

			next(error)

		}

	}



	public getVenueFull = async (

		req: Request<{ id: string }>,

		res: Response,

		next: NextFunction,

	): Promise<void> => {

		try {

			const venueId = Number(req.params.id)

			if (Number.isNaN(venueId)) {

				throw new AppError('Invalid venue id', 400)

			}



			const venueFull = await this.venuesService.getVenueFull(venueId)

			sendSuccess(res, 200, 'Venue full details fetched successfully', venueFull)

		} catch (error) {

			next(error)

		}

	}



	public getVenueBookingCalendar = async (

		req: Request<{ id: string }>,

		res: Response,

		next: NextFunction,

	): Promise<void> => {

		try {

			const user = getUserFromRequest(req)

			const venueId = Number(req.params.id)

			if (Number.isNaN(venueId)) {

				throw new AppError('Invalid venue id', 400)

			}



			const calendar = await this.venuesService.getVenueBookingCalendar(

				venueId,

				user?.role,

				user?.id,

			)

			sendSuccess(res, 200, 'Venue booking calendar fetched successfully', calendar)

		} catch (error) {

			next(error)

		}

	}



	private parseFilters(query: Request['query']): VenueFilters {

		const toNumber = (value: unknown): number | undefined => {

			if (value === undefined) return undefined

			const parsed = Number(value)

			return Number.isNaN(parsed) ? undefined : parsed

		}



		return {

			district: typeof query.district === 'string' ? query.district : undefined,

			capacity: toNumber(query.capacity),

			minPrice: toNumber(query.minPrice),

			maxPrice: toNumber(query.maxPrice),

			search: typeof query.search === 'string' ? query.search : undefined,

			page: toNumber(query.page),

			limit: toNumber(query.limit),

		}

	}

}

