import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { VenueImagesService } from './venue-images.service'

export class VenueImagesController {
	constructor(private readonly venueImagesService: VenueImagesService) {}

	public uploadImage = async (
		req: Request<{ venueId: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			const venueId = Number(req.params.venueId)
			if (Number.isNaN(venueId)) {
				throw new AppError('Invalid venue id', 400)
			}

			const file = req.file
			const role = user.role === 'admin' ? 'admin' : 'owner'
			const image = await this.venueImagesService.uploadImage(
				user.id,
				role,
				venueId,
				file,
			)
			sendSuccess(res, 201, 'Venue image uploaded successfully', image)
		} catch (error) {
			next(error)
		}
	}

	public getImages = async (
		req: Request<{ venueId: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const venueId = Number(req.params.venueId)
			if (Number.isNaN(venueId)) {
				throw new AppError('Invalid venue id', 400)
			}

			const user = getUserFromRequest(req)
			const images = await this.venueImagesService.getImages(
				venueId,
				user?.role,
				user?.id,
			)
			sendSuccess(res, 200, 'Venue images fetched successfully', images)
		} catch (error) {
			next(error)
		}
	}

	public deleteImage = async (
		req: Request<{ imageId: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) {
				throw new AppError('Unauthorized', 401)
			}

			const imageId = Number(req.params.imageId)
			if (Number.isNaN(imageId)) {
				throw new AppError('Invalid image id', 400)
			}

			const role = user.role === 'admin' ? 'admin' : 'owner'
			await this.venueImagesService.deleteImage(role, user.id, imageId)
			sendSuccess(res, 200, 'Venue image deleted successfully')
		} catch (error) {
			next(error)
		}
	}
}
