import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import {
	CreateKarnaySurnayRequestBody,
	KarnaySurnayEntity,
	UpdateKarnaySurnayRequestBody,
} from './karnay-surnay.types'

export class KarnaySurnayRepository {
	public async create(
		payload: CreateKarnaySurnayRequestBody,
	): Promise<KarnaySurnayEntity> {
		const result: QueryResult<KarnaySurnayEntity> = await pool.query(
			'INSERT INTO karnay_surnay (venue_id, is_available, price) VALUES ($1, $2, $3) RETURNING id, venue_id, is_available, price',
			[payload.venueId, payload.isAvailable, payload.price],
		)
		return result.rows[0]
	}
	public async findById(id: number): Promise<KarnaySurnayEntity | null> {
		const result: QueryResult<KarnaySurnayEntity> = await pool.query(
			'SELECT id, venue_id, is_available, price FROM karnay_surnay WHERE id = $1 LIMIT 1',
			[id],
		)
		return result.rows[0] || null
	}
	public async listByVenueIds(
		venueIds?: number[],
	): Promise<KarnaySurnayEntity[]> {
		if (venueIds && venueIds.length > 0) {
			const result: QueryResult<KarnaySurnayEntity> = await pool.query(
				'SELECT id, venue_id, is_available, price FROM karnay_surnay WHERE venue_id = ANY($1::int[]) ORDER BY id DESC',
				[venueIds],
			)
			return result.rows
		}
		const result: QueryResult<KarnaySurnayEntity> = await pool.query(
			'SELECT id, venue_id, is_available, price FROM karnay_surnay ORDER BY id DESC',
		)
		return result.rows
	}
	public async update(
		id: number,
		payload: UpdateKarnaySurnayRequestBody,
	): Promise<KarnaySurnayEntity | null> {
		const fields: string[] = []
		const values: Array<string | number | boolean> = []
		let index = 1
		if (payload.isAvailable !== undefined) {
			fields.push(`is_available = $${index}`)
			values.push(payload.isAvailable)
			index += 1
		}
		if (payload.price !== undefined) {
			fields.push(`price = $${index}`)
			values.push(payload.price)
			index += 1
		}
		if (fields.length === 0) return this.findById(id)
		values.push(id)
		const result: QueryResult<KarnaySurnayEntity> = await pool.query(
			`UPDATE karnay_surnay SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, venue_id, is_available, price`,
			values,
		)
		return result.rows[0] || null
	}
	public async delete(id: number): Promise<boolean> {
		const result = await pool.query(
			'DELETE FROM karnay_surnay WHERE id = $1 RETURNING id',
			[id],
		)
		return (result.rowCount ?? 0) > 0
	}
}
