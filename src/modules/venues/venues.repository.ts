import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import {
	CreateVenueRequestBody,
	UpdateVenueRequestBody,
	UpdateVenueStatusRequestBody,
	VenueEntity,
	VenueFilters,
} from './venues.types'

const VENUE_SELECT_COLUMNS = `
	id,
	owner_id,
	name,
	district,
	address,
	capacity,
	price_per_seat,
	phone,
	status,
	created_at
`

export class VenuesRepository {
	public async createVenue(
		ownerId: number,
		payload: CreateVenueRequestBody,
	): Promise<VenueEntity> {
		const query = `
			INSERT INTO venues (owner_id, name, district, address, capacity, price_per_seat, phone, status)
			VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
			RETURNING ${VENUE_SELECT_COLUMNS}
		`

		const result: QueryResult<VenueEntity> = await pool.query(query, [
			ownerId,
			payload.name,
			payload.district,
			payload.address,
			payload.capacity,
			payload.pricePerSeat,
			payload.phone,
		])

		return result.rows[0]
	}

	public async findById(id: number): Promise<VenueEntity | null> {
		const query = `
			SELECT ${VENUE_SELECT_COLUMNS}
			FROM venues
			WHERE id = $1
			LIMIT 1
		`

		const result: QueryResult<VenueEntity> = await pool.query(query, [id])
		return result.rows[0] || null
	}

	public async listVenues(
		filters: VenueFilters,
		userRole?: string,
		userId?: number,
	): Promise<{ items: VenueEntity[]; total: number }> {
		const conditions: string[] = []
		const values: Array<string | number> = []
		let index = 1

		if (userRole === 'customer' || !userRole) {
			conditions.push(`status = 'approved'`)
		}

		if (userRole === 'owner' && userId) {
			conditions.push(`owner_id = $${index}`)
			values.push(userId)
			index += 1
		} else if (userRole === 'admin') {
			// no default restriction
		}

		if (filters.district) {
			conditions.push(`district ILIKE $${index}`)
			values.push(`%${filters.district}%`)
			index += 1
		}

		if (filters.capacity !== undefined) {
			conditions.push(`capacity >= $${index}`)
			values.push(filters.capacity)
			index += 1
		}

		if (filters.minPrice !== undefined) {
			conditions.push(`price_per_seat >= $${index}`)
			values.push(filters.minPrice)
			index += 1
		}

		if (filters.maxPrice !== undefined) {
			conditions.push(`price_per_seat <= $${index}`)
			values.push(filters.maxPrice)
			index += 1
		}

		if (filters.search) {
			conditions.push(
				`(name ILIKE $${index} OR district ILIKE $${index} OR address ILIKE $${index})`,
			)
			values.push(`%${filters.search}%`)
			index += 1
		}

		const page = filters.page && filters.page > 0 ? filters.page : 1
		const limit = filters.limit && filters.limit > 0 ? filters.limit : 10
		const offset = (page - 1) * limit

		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

		const countQuery = `SELECT COUNT(*)::int AS total FROM venues ${whereClause}`
		const listQuery = `
			SELECT ${VENUE_SELECT_COLUMNS}
			FROM venues
			${whereClause}
			ORDER BY created_at DESC
			LIMIT $${index} OFFSET $${index + 1}
		`

		const countResult: QueryResult<{ total: number }> = await pool.query(
			countQuery,
			values,
		)
		const listResult: QueryResult<VenueEntity> = await pool.query(listQuery, [
			...values,
			limit,
			offset,
		])

		return {
			items: listResult.rows,
			total: countResult.rows[0]?.total || 0,
		}
	}

	public async updateVenue(
		id: number,
		payload: UpdateVenueRequestBody,
	): Promise<VenueEntity | null> {
		const fields: string[] = []
		const values: Array<string | number> = []
		let index = 1

		if (payload.name !== undefined) {
			fields.push(`name = $${index}`)
			values.push(payload.name)
			index += 1
		}
		if (payload.district !== undefined) {
			fields.push(`district = $${index}`)
			values.push(payload.district)
			index += 1
		}
		if (payload.address !== undefined) {
			fields.push(`address = $${index}`)
			values.push(payload.address)
			index += 1
		}
		if (payload.capacity !== undefined) {
			fields.push(`capacity = $${index}`)
			values.push(payload.capacity)
			index += 1
		}
		if (payload.pricePerSeat !== undefined) {
			fields.push(`price_per_seat = $${index}`)
			values.push(payload.pricePerSeat)
			index += 1
		}
		if (payload.phone !== undefined) {
			fields.push(`phone = $${index}`)
			values.push(payload.phone)
			index += 1
		}

		if (fields.length === 0) {
			return this.findById(id)
		}

		const query = `
			UPDATE venues
			SET ${fields.join(', ')}
			WHERE id = $${index}
			RETURNING ${VENUE_SELECT_COLUMNS}
		`

		values.push(id)
		const result: QueryResult<VenueEntity> = await pool.query(query, values)
		return result.rows[0] || null
	}

	public async updateVenueStatus(
		id: number,
		payload: UpdateVenueStatusRequestBody,
	): Promise<VenueEntity | null> {
		const query = `
			UPDATE venues
			SET status = $1
			WHERE id = $2
			RETURNING ${VENUE_SELECT_COLUMNS}
		`

		const result: QueryResult<VenueEntity> = await pool.query(query, [
			payload.status,
			id,
		])
		return result.rows[0] || null
	}

	public async deleteVenue(id: number): Promise<boolean> {
		const query = `DELETE FROM venues WHERE id = $1 RETURNING id`
		const result = await pool.query<{ id: number }>(query, [id])
		return (result.rowCount ?? 0) > 0
	}
}
