import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import {
	CarEntity,
	CreateCarRequestBody,
	UpdateCarRequestBody,
} from './cars.types'

export class CarsRepository {
	public async create(payload: CreateCarRequestBody): Promise<CarEntity> {
		const result: QueryResult<CarEntity> = await pool.query(
			'INSERT INTO cars (venue_id, brand, price, image_url) VALUES ($1, $2, $3, $4) RETURNING id, venue_id, brand, price, image_url',
			[payload.venueId, payload.brand, payload.price, payload.imageUrl || null],
		)
		return result.rows[0]
	}
	public async findById(id: number): Promise<CarEntity | null> {
		const result: QueryResult<CarEntity> = await pool.query(
			'SELECT id, venue_id, brand, price, image_url FROM cars WHERE id = $1 LIMIT 1',
			[id],
		)
		return result.rows[0] || null
	}
	public async listByVenueIds(venueIds?: number[]): Promise<CarEntity[]> {
		if (venueIds && venueIds.length > 0) {
			const result: QueryResult<CarEntity> = await pool.query(
				'SELECT id, venue_id, brand, price, image_url FROM cars WHERE venue_id = ANY($1::int[]) ORDER BY id DESC',
				[venueIds],
			)
			return result.rows
		}
		const result: QueryResult<CarEntity> = await pool.query(
			'SELECT id, venue_id, brand, price, image_url FROM cars ORDER BY id DESC',
		)
		return result.rows
	}
	public async update(
		id: number,
		payload: UpdateCarRequestBody,
	): Promise<CarEntity | null> {
		const fields: string[] = []
		const values: Array<string | number | null> = []
		let index = 1
		if (payload.brand !== undefined) {
			fields.push(`brand = $${index}`)
			values.push(payload.brand)
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
		const result: QueryResult<CarEntity> = await pool.query(
			`UPDATE cars SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, venue_id, brand, price, image_url`,
			values,
		)
		return result.rows[0] || null
	}
	public async delete(id: number): Promise<boolean> {
		const result = await pool.query(
			'DELETE FROM cars WHERE id = $1 RETURNING id',
			[id],
		)
		return (result.rowCount ?? 0) > 0
	}
}
