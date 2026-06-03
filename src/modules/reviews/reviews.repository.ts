import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import { CreateReviewRequestBody, ReviewEntity, UpdateReviewRequestBody } from './reviews.types'

export class ReviewsRepository {
	public async createReview(
		userId: number,
		payload: CreateReviewRequestBody,
	): Promise<ReviewEntity> {
		const result: QueryResult<ReviewEntity> = await pool.query(
			'INSERT INTO reviews (user_id, venue_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING id, user_id, venue_id, rating, comment, created_at',
			[userId, payload.venueId, payload.rating, payload.comment],
		)
		return result.rows[0]
	}

	public async findById(id: number): Promise<ReviewEntity | null> {
		const result: QueryResult<ReviewEntity> = await pool.query(
			'SELECT id, user_id, venue_id, rating, comment, created_at FROM reviews WHERE id = $1 LIMIT 1',
			[id],
		)
		return result.rows[0] || null
	}

	public async findByVenueId(venueId: number): Promise<ReviewEntity[]> {
		const result: QueryResult<ReviewEntity> = await pool.query(
			'SELECT id, user_id, venue_id, rating, comment, created_at FROM reviews WHERE venue_id = $1 ORDER BY created_at DESC',
			[venueId],
		)
		return result.rows
	}

	public async findByUserId(userId: number): Promise<ReviewEntity[]> {
		const result: QueryResult<ReviewEntity> = await pool.query(
			'SELECT id, user_id, venue_id, rating, comment, created_at FROM reviews WHERE user_id = $1 ORDER BY created_at DESC',
			[userId],
		)
		return result.rows
	}

	public async updateReview(
		id: number,
		payload: UpdateReviewRequestBody,
	): Promise<ReviewEntity | null> {
		const fields: string[] = []
		const values: Array<number | string> = []
		let index = 1

		if (payload.rating !== undefined) {
			fields.push(`rating = $${index}`)
			values.push(payload.rating)
			index += 1
		}

		if (payload.comment !== undefined) {
			fields.push(`comment = $${index}`)
			values.push(payload.comment)
			index += 1
		}

		if (fields.length === 0) return this.findById(id)

		values.push(id)
		const result: QueryResult<ReviewEntity> = await pool.query(
			`UPDATE reviews SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, user_id, venue_id, rating, comment, created_at`,
			values,
		)
		return result.rows[0] || null
	}

	public async deleteReview(id: number): Promise<boolean> {
		const result = await pool.query(
			'DELETE FROM reviews WHERE id = $1 RETURNING id',
			[id],
		)
		return (result.rowCount ?? 0) > 0
	}

	public async getUserReviewForVenue(
		userId: number,
		venueId: number,
	): Promise<ReviewEntity | null> {
		const result: QueryResult<ReviewEntity> = await pool.query(
			'SELECT id, user_id, venue_id, rating, comment, created_at FROM reviews WHERE user_id = $1 AND venue_id = $2 LIMIT 1',
			[userId, venueId],
		)
		return result.rows[0] || null
	}
}
