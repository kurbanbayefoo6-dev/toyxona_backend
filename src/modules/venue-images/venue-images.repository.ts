import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import { VenueImageEntity } from './venue-images.types'

export class VenueImagesRepository {
	public async create(
		venueId: number,
		imageUrl: string,
	): Promise<VenueImageEntity> {
		const query = `
			INSERT INTO venue_images (venue_id, image_url)
			VALUES ($1, $2)
			RETURNING id, venue_id, image_url
		`

		const result: QueryResult<VenueImageEntity> = await pool.query(query, [
			venueId,
			imageUrl,
		])
		return result.rows[0]
	}

	public async findByVenueId(venueId: number): Promise<VenueImageEntity[]> {
		const query = `
			SELECT id, venue_id, image_url
			FROM venue_images
			WHERE venue_id = $1
			ORDER BY id DESC
		`

		const result: QueryResult<VenueImageEntity> = await pool.query(query, [
			venueId,
		])
		return result.rows
	}

	public async findById(imageId: number): Promise<VenueImageEntity | null> {
		const query = `
			SELECT id, venue_id, image_url
			FROM venue_images
			WHERE id = $1
			LIMIT 1
		`

		const result: QueryResult<VenueImageEntity> = await pool.query(query, [
			imageId,
		])
		return result.rows[0] || null
	}

	public async deleteById(imageId: number): Promise<boolean> {
		const result = await pool.query(
			'DELETE FROM venue_images WHERE id = $1 RETURNING id',
			[imageId],
		)
		return (result.rowCount ?? 0) > 0
	}
}
