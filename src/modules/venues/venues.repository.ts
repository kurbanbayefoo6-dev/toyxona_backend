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
			// Support first-letter search (e.g., "G" matches venues starting with "G")
			if (filters.search.length === 1) {
				conditions.push(`name ILIKE $${index}`)
				values.push(`${filters.search}%`)
			} else {
				// Partial search
				conditions.push(
					`(name ILIKE $${index} OR district ILIKE $${index} OR address ILIKE $${index})`,
				)
				values.push(`%${filters.search}%`)
			}
			index += 1
		}

		const page = filters.page && filters.page > 0 ? filters.page : 1
		const limit = filters.limit && filters.limit > 0 ? filters.limit : 10
		const offset = (page - 1) * limit

		// Dynamic sorting
		const validSortFields = [
			'created_at',
			'name',
			'district',
			'capacity',
			'price_per_seat',
			'status',
		]
		const sortBy = validSortFields.includes(filters.sortBy || '')
			? filters.sortBy!
			: 'created_at'
		const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC'

		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

		const countQuery = `SELECT COUNT(*)::int AS total FROM venues ${whereClause}`
		const listQuery = `
			SELECT ${VENUE_SELECT_COLUMNS}
			FROM venues
			${whereClause}
			ORDER BY ${sortBy} ${sortOrder}
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

	public async getVenueAvailability(
		venueId: number,
	): Promise<{ availableDates: string[]; bookedDates: string[]; pastDates: string[] }> {
		const today = new Date().toISOString().split('T')[0]

		// Get all booked dates (excluding cancelled)
		const bookedResult = await pool.query<{ booking_date: string }>(
			`SELECT DISTINCT booking_date FROM bookings WHERE venue_id = $1 AND status <> 'cancelled'`,
			[venueId],
		)

		const bookedDates = bookedResult.rows.map(row => row.booking_date)

		// Get past dates (bookings before today)
		const pastResult = await pool.query<{ booking_date: string }>(
			`SELECT DISTINCT booking_date FROM bookings WHERE venue_id = $1 AND booking_date < $2`,
			[venueId, today],
		)

		const pastDates = pastResult.rows.map(row => row.booking_date)

		// Available dates = all dates minus booked dates (simplified for now)
		// In production, you might want to return a date range instead
		const availableDates: string[] = []

		return {
			availableDates,
			bookedDates,
			pastDates,
		}
	}

	public async getVenueBookingCalendar(
		venueId: number,
	): Promise<
		Array<{
			bookingId: number
			bookingDate: string
			customerName: string
			customerPhone: string
			guestCount: number
			status: 'upcoming' | 'completed' | 'cancelled'
		}>
	> {
		const result = await pool.query<{
			bookingId: number
			bookingDate: string
			customerName: string
			customerPhone: string
			guestCount: number
			status: 'upcoming' | 'completed' | 'cancelled'
		}>(
			`SELECT
				b.id AS "bookingId",
				b.booking_date AS "bookingDate",
				COALESCE(u.first_name || ' ' || u.last_name, u.username) AS "customerName",
				u.phone AS "customerPhone",
				b.guest_count AS "guestCount",
				b.status
			FROM bookings b
			INNER JOIN users u ON u.id = b.customer_id
			WHERE b.venue_id = $1
			ORDER BY b.booking_date DESC`,
			[venueId],
		)

		return result.rows
	}

	public async getVenueImages(venueId: number): Promise<Array<{ id: number; imageUrl: string }>> {
		const result = await pool.query<{ id: number; image_url: string }>(
			'SELECT id, image_url FROM venue_images WHERE venue_id = $1',
			[venueId],
		)
		return result.rows.map(row => ({ id: row.id, imageUrl: row.image_url }))
	}

	public async getVenueSingers(venueId: number): Promise<Array<{ id: number; name: string; price: number; imageUrl: string | null }>> {
		const result = await pool.query<{ id: number; name: string; price: number; image_url: string | null }>(
			'SELECT id, name, price, image_url FROM singers WHERE venue_id = $1',
			[venueId],
		)
		return result.rows.map(row => ({ id: row.id, name: row.name, price: row.price, imageUrl: row.image_url }))
	}

	public async getVenueMenuItems(venueId: number): Promise<Array<{ id: number; name: string; imageUrl: string | null }>> {
		const result = await pool.query<{ id: number; name: string; image_url: string | null }>(
			'SELECT id, name, image_url FROM menu_items WHERE venue_id = $1',
			[venueId],
		)
		return result.rows.map(row => ({ id: row.id, name: row.name, imageUrl: row.image_url }))
	}

	public async getVenueCars(venueId: number): Promise<Array<{ id: number; brand: string; price: number; imageUrl: string | null }>> {
		const result = await pool.query<{ id: number; brand: string; price: number; image_url: string | null }>(
			'SELECT id, brand, price, image_url FROM cars WHERE venue_id = $1',
			[venueId],
		)
		return result.rows.map(row => ({ id: row.id, brand: row.brand, price: row.price, imageUrl: row.image_url }))
	}

	public async getVenueKarnaySurnay(venueId: number): Promise<Array<{ id: number; isAvailable: boolean; price: number }>> {
		const result = await pool.query<{ id: number; is_available: boolean; price: number }>(
			'SELECT id, is_available, price FROM karnay_surnay WHERE venue_id = $1',
			[venueId],
		)
		return result.rows.map(row => ({ id: row.id, isAvailable: row.is_available, price: row.price }))
	}
}
