import { AppError } from '../../middleware/error.middleware'
import { idsEqual } from '../../utils/coerceId'
import { VenuesRepository } from '../venues/venues.repository'
import { BookingsRepository } from '../bookings/bookings.repository'
import { ReviewsRepository } from './reviews.repository'
import {
	CreateReviewRequestBody,
	ReviewEntity,
	SafeReview,
	UpdateReviewRequestBody,
} from './reviews.types'

export class ReviewsService {
	constructor(
		private readonly reviewsRepository: ReviewsRepository,
		private readonly venuesRepository: VenuesRepository,
		private readonly bookingsRepository: BookingsRepository,
	) {}

	public async createReview(
		userId: number,
		payload: CreateReviewRequestBody,
	): Promise<SafeReview> {
		if (payload.rating < 1 || payload.rating > 5) {
			throw new AppError('Rating must be between 1 and 5', 400)
		}

		const venue = await this.venuesRepository.findById(payload.venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		if (venue.status !== 'approved') {
			throw new AppError('Venue not found', 404)
		}

		const existingReview =
			await this.reviewsRepository.getUserReviewForVenue(
				userId,
				payload.venueId,
			)
		if (existingReview) {
			throw new AppError('You have already reviewed this venue', 409)
		}

		const review = await this.reviewsRepository.createReview(userId, payload)
		return this.toSafe(review)
	}

	public async getVenueReviews(venueId: number): Promise<SafeReview[]> {
		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		const reviews = await this.reviewsRepository.findByVenueId(venueId)
		return reviews.map(review => this.toSafe(review))
	}

	public async getUserReviews(userId: number): Promise<SafeReview[]> {
		const reviews = await this.reviewsRepository.findByUserId(userId)
		return reviews.map(review => this.toSafe(review))
	}

	public async updateReview(
		userId: number,
		reviewId: number,
		payload: UpdateReviewRequestBody,
	): Promise<SafeReview> {
		if (payload.rating !== undefined && (payload.rating < 1 || payload.rating > 5)) {
			throw new AppError('Rating must be between 1 and 5', 400)
		}

		const review = await this.reviewsRepository.findById(reviewId)
		if (!review) {
			throw new AppError('Review not found', 404)
		}

		if (!idsEqual(review.user_id, userId)) {
			throw new AppError('Forbidden', 403)
		}

		const updated = await this.reviewsRepository.updateReview(reviewId, payload)
		if (!updated) {
			throw new AppError('Review not found', 404)
		}
		return this.toSafe(updated)
	}

	public async deleteReview(userId: number, reviewId: number): Promise<void> {
		const review = await this.reviewsRepository.findById(reviewId)
		if (!review) {
			throw new AppError('Review not found', 404)
		}

		if (!idsEqual(review.user_id, userId)) {
			throw new AppError('Forbidden', 403)
		}

		const deleted = await this.reviewsRepository.deleteReview(reviewId)
		if (!deleted) {
			throw new AppError('Review not found', 404)
		}
	}

	private toSafe(review: ReviewEntity): SafeReview {
		return {
			id: review.id,
			userId: review.user_id,
			venueId: review.venue_id,
			rating: review.rating,
			comment: review.comment,
			createdAt: review.created_at,
		}
	}
}
