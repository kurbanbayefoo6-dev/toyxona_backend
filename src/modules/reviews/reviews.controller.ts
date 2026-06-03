import { NextFunction, Request, Response } from 'express'

import { AppError } from '../../middleware/error.middleware'
import { sendSuccess } from '../../utils/response'
import { getUserFromRequest } from '../../utils/request'
import { ReviewsService } from './reviews.service'
import { CreateReviewRequestBody, UpdateReviewRequestBody } from './reviews.types'

export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	public create = async (
		req: Request<unknown, unknown, CreateReviewRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)
			if (user.role !== 'customer')
				throw new AppError('Only customers can create reviews', 403)

			const review = await this.reviewsService.createReview(user.id, req.body)
			sendSuccess(res, 201, 'Review created successfully', review)
		} catch (error) {
			next(error)
		}
	}

	public getVenueReviews = async (
		req: Request<{ venueId: string }>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const venueId = Number(req.params.venueId)
			if (Number.isNaN(venueId)) throw new AppError('Invalid venue id', 400)

			const reviews = await this.reviewsService.getVenueReviews(venueId)
			sendSuccess(res, 200, 'Venue reviews fetched', reviews)
		} catch (error) {
			next(error)
		}
	}

	public getUserReviews = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)

			const reviews = await this.reviewsService.getUserReviews(user.id)
			sendSuccess(res, 200, 'User reviews fetched', reviews)
		} catch (error) {
			next(error)
		}
	}

	public update = async (
		req: Request<{ id: string }, unknown, UpdateReviewRequestBody>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const user = getUserFromRequest(req)
			if (!user) throw new AppError('Unauthorized', 401)

			const reviewId = Number(req.params.id)
			if (Number.isNaN(reviewId)) throw new AppError('Invalid review id', 400)

			const review = await this.reviewsService.updateReview(
				user.id,
				reviewId,
				req.body,
			)
			sendSuccess(res, 200, 'Review updated successfully', review)
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

			const reviewId = Number(req.params.id)
			if (Number.isNaN(reviewId)) throw new AppError('Invalid review id', 400)

			await this.reviewsService.deleteReview(user.id, reviewId)
			sendSuccess(res, 200, 'Review deleted successfully')
		} catch (error) {
			next(error)
		}
	}
}
