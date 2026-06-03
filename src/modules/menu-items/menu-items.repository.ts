import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import {
	CreateMenuItemRequestBody,
	MenuItemEntity,
	UpdateMenuItemRequestBody,
} from './menu-items.types'

export class MenuItemsRepository {
	public async create(
		payload: CreateMenuItemRequestBody,
	): Promise<MenuItemEntity> {
		const query = `
			INSERT INTO menu_items (venue_id, name, image_url)
			VALUES ($1, $2, $3)
			RETURNING id, venue_id, name, image_url
		`
		const result: QueryResult<MenuItemEntity> = await pool.query(query, [
			payload.venueId,
			payload.name,
			payload.imageUrl || null,
		])
		return result.rows[0]
	}

	public async findById(id: number): Promise<MenuItemEntity | null> {
		const query = `SELECT id, venue_id, name, image_url FROM menu_items WHERE id = $1 LIMIT 1`
		const result: QueryResult<MenuItemEntity> = await pool.query(query, [id])
		return result.rows[0] || null
	}

	public async listByVenueIds(venueIds?: number[]): Promise<MenuItemEntity[]> {
		if (venueIds && venueIds.length > 0) {
			const query = `SELECT id, venue_id, name, image_url FROM menu_items WHERE venue_id = ANY($1::int[]) ORDER BY id DESC`
			const result: QueryResult<MenuItemEntity> = await pool.query(query, [
				venueIds,
			])
			return result.rows
		}

		const query = `SELECT id, venue_id, name, image_url FROM menu_items ORDER BY id DESC`
		const result: QueryResult<MenuItemEntity> = await pool.query(query)
		return result.rows
	}

	public async update(
		id: number,
		payload: UpdateMenuItemRequestBody,
	): Promise<MenuItemEntity | null> {
		const fields: string[] = []
		const values: Array<string | number | null> = []
		let index = 1

		if (payload.name !== undefined) {
			fields.push(`name = $${index}`)
			values.push(payload.name)
			index += 1
		}
		if (payload.imageUrl !== undefined) {
			fields.push(`image_url = $${index}`)
			values.push(payload.imageUrl)
			index += 1
		}

		if (fields.length === 0) {
			return this.findById(id)
		}

		const query = `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, venue_id, name, image_url`
		values.push(id)
		const result: QueryResult<MenuItemEntity> = await pool.query(query, values)
		return result.rows[0] || null
	}

	public async delete(id: number): Promise<boolean> {
		const result = await pool.query(
			'DELETE FROM menu_items WHERE id = $1 RETURNING id',
			[id],
		)
		return (result.rowCount ?? 0) > 0
	}
}
