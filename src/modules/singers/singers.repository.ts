import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import {
	CreateSingerRequestBody,
	SingerEntity,
	UpdateSingerRequestBody,
} from './singers.types'

export class SingersRepository {
	public async create(payload: CreateSingerRequestBody): Promise<SingerEntity> {
		const query = `
			INSERT INTO singers (venue_id, name, price, image_url)
			VALUES ($1, $2, $3, $4)
			RETURNING id, venue_id, name, price, image_url
		`
		const result: QueryResult<SingerEntity> = await pool.query(query, [
			payload.venueId,
			payload.name,
			payload.price,
			payload.imageUrl || null,
		])
		return result.rows[0]
	}

	public async findById(id: number): Promise<SingerEntity | null> {
		const result: QueryResult<SingerEntity> = await pool.query(
			'SELECT id, venue_id, name, price, image_url FROM singers WHERE id = $1 LIMIT 1',
			[id],
		)
		return result.rows[0] || null
	}

	public async listByVenueIds(venueIds?: number[]): Promise<SingerEntity[]> {
		if (venueIds && venueIds.length > 0) {
			const result: QueryResult<SingerEntity> = await pool.query(
				'SELECT id, venue_id, name, price, image_url FROM singers WHERE venue_id = ANY($1::int[]) ORDER BY id DESC',
				[venueIds],
			)
			return result.rows
		}
		const result: QueryResult<SingerEntity> = await pool.query(
			'SELECT id, venue_id, name, price, image_url FROM singers ORDER BY id DESC',
		)
		return result.rows
	}

	public async update(
		id: number,
		payload: UpdateSingerRequestBody,
	): Promise<SingerEntity | null> {
		const fields: string[] = []
		const values: Array<string | number | null> = []
		let index = 1
		if (payload.name !== undefined) {
			fields.push(`name = $${index}`)
			values.push(payload.name)
			index += 1
		}
		if (payload.price !== undefined) {
			fields.push(`price = $${index}`)
			values.push(payload.price)
			index += 1
		}
		if (payload.imageUrl !== undefined) {
			fields.push(`image_url = $${index}`)
			values.push(payload.imageUrl)
			index += 1
		}
		if (fields.length === 0) return this.findById(id)
		values.push(id)
		const result: QueryResult<SingerEntity> = await pool.query(
			`UPDATE singers SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, venue_id, name, price, image_url`,
			values,
		)
		return result.rows[0] || null
	}

	public async delete(id: number): Promise<boolean> {
		const result = await pool.query(
			'DELETE FROM singers WHERE id = $1 RETURNING id',
			[id],
		)
		return (result.rowCount ?? 0) > 0
	}
}
