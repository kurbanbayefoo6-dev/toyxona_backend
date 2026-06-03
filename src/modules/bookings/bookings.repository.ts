import { PoolClient, QueryResult } from 'pg'

import { pool } from '../../config/db'
import { AppError } from '../../middleware/error.middleware'
import {
	BookingEntity,
	BookingFilters,
	BookingListItem,
} from './bookings.types'

interface PriceRow {
	id: number
	price: number
}

interface SelectedItemRow {
	id: number
	price: number
}

export class BookingsRepository {
	public async findVenueById(
		venueId: number,
	): Promise<{
		id: number
		owner_id: number
		price_per_seat: number
		status: 'pending' | 'approved' | 'rejected'
		name: string
	} | null> {
		const result = await pool.query<{
			id: number
			owner_id: number
			price_per_seat: number
			status: 'pending' | 'approved' | 'rejected'
			name: string
		}>(
			'SELECT id, owner_id, price_per_seat, status, name FROM venues WHERE id = $1 LIMIT 1',
			[venueId],
		)
		return result.rows[0] || null
	}

	public async findSingersByIds(
		venueId: number,
		ids: number[],
	): Promise<PriceRow[]> {
		if (ids.length === 0) return []
		const result: QueryResult<PriceRow> = await pool.query(
			'SELECT id, price FROM singers WHERE venue_id = $1 AND id = ANY($2::int[])',
			[venueId, ids],
		)
		return result.rows
	}

	public async findCarsByIds(
		venueId: number,
		ids: number[],
	): Promise<PriceRow[]> {
		if (ids.length === 0) return []
		const result: QueryResult<PriceRow> = await pool.query(
			'SELECT id, price FROM cars WHERE venue_id = $1 AND id = ANY($2::int[])',
			[venueId, ids],
		)
		return result.rows
	}

	public async findKarnaySurnayByIds(
		venueId: number,
		ids: number[],
	): Promise<PriceRow[]> {
		if (ids.length === 0) return []
		const result: QueryResult<PriceRow> = await pool.query(
			'SELECT id, price FROM karnay_surnay WHERE venue_id = $1 AND id = ANY($2::int[])',
			[venueId, ids],
		)
		return result.rows
	}

	public async hasBookingForVenueAndDate(
		venueId: number,
		bookingDate: string,
		client: PoolClient,
	): Promise<boolean> {
		const result = await client.query(
			`SELECT id FROM bookings
			 WHERE venue_id = $1 AND booking_date = $2 AND status <> 'cancelled'
			 LIMIT 1`,
			[venueId, bookingDate],
		)
		return (result.rowCount ?? 0) > 0
	}

	public async createBooking(
		customerId: number,
		payload: {
			venueId: number
			bookingDate: string
			guestCount: number
			totalPrice: number
			advanceAmount: number
			singerIds: number[]
			carIds: number[]
			karnaySurnayIds: number[]
		},
	): Promise<BookingEntity> {
		const client = await pool.connect()
		try {
			await client.query('BEGIN')

			const venue = await client.query<{
				id: number
				owner_id: number
				price_per_seat: number
				status: 'pending' | 'approved' | 'rejected'
				name: string
			}>(
				'SELECT id, owner_id, price_per_seat, status, name FROM venues WHERE id = $1 LIMIT 1',
				[payload.venueId],
			)

			if (!venue.rows[0]) {
				throw new AppError('Venue not found', 404)
			}

			if (venue.rows[0].status !== 'approved') {
				throw new AppError('Venue is not approved', 400)
			}

			if (
				await this.hasBookingForVenueAndDate(
					payload.venueId,
					payload.bookingDate,
					client,
				)
			) {
				throw new AppError('Venue is already booked for this date', 409)
			}

			const bookingResult = await client.query<BookingEntity>(
				`INSERT INTO bookings (venue_id, customer_id, booking_date, guest_count, total_price, advance_amount, status)
				 VALUES ($1, $2, $3, $4, $5, $6, 'upcoming')
				 RETURNING id, venue_id, customer_id, booking_date, guest_count, total_price, advance_amount, status, created_at`,
				[
					payload.venueId,
					customerId,
					payload.bookingDate,
					payload.guestCount,
					payload.totalPrice,
					payload.advanceAmount,
				],
			)

			const booking = bookingResult.rows[0]

			if (payload.singerIds.length > 0) {
				const singerRows = await this.findSingersByIds(
					payload.venueId,
					payload.singerIds,
				)
				if (singerRows.length !== payload.singerIds.length) {
					throw new AppError('Invalid singer selected', 400)
				}
				for (const singer of singerRows) {
					await client.query(
						'INSERT INTO booking_singers (booking_id, singer_id, price) VALUES ($1, $2, $3)',
						[booking.id, singer.id, singer.price],
					)
				}
			}

			if (payload.carIds.length > 0) {
				const carRows = await this.findCarsByIds(
					payload.venueId,
					payload.carIds,
				)
				if (carRows.length !== payload.carIds.length) {
					throw new AppError('Invalid car selected', 400)
				}
				for (const car of carRows) {
					await client.query(
						'INSERT INTO booking_cars (booking_id, car_id, price) VALUES ($1, $2, $3)',
						[booking.id, car.id, car.price],
					)
				}
			}

			if (payload.karnaySurnayIds.length > 0) {
				const karnayRows = await this.findKarnaySurnayByIds(
					payload.venueId,
					payload.karnaySurnayIds,
				)
				if (karnayRows.length !== payload.karnaySurnayIds.length) {
					throw new AppError('Invalid karnay surnay selected', 400)
				}
				for (const karnay of karnayRows) {
					await client.query(
						'INSERT INTO booking_karnay_surnay (booking_id, karnay_surnay_id, price) VALUES ($1, $2, $3)',
						[booking.id, karnay.id, karnay.price],
					)
				}
			}

			await client.query('COMMIT')
			return booking
		} catch (error) {
			await client.query('ROLLBACK')
			if (error instanceof AppError) {
				throw error
			}
			if (
				typeof error === 'object' &&
				error &&
				'code' in error &&
				(error as { code?: string }).code === '23505'
			) {
				throw new AppError('Venue is already booked for this date', 409)
			}
			throw error
		} finally {
			client.release()
		}
	}

	public async listBookings(
		userRole: 'admin' | 'owner' | 'customer',
		userId: number,
		filters: BookingFilters,
	): Promise<{ items: BookingListItem[]; total: number }> {
		const conditions: string[] = []
		const values: Array<string | number> = []
		let index = 1

		if (userRole === 'customer') {
			conditions.push(`b.customer_id = $${index}`)
			values.push(userId)
			index += 1
		}

		if (userRole === 'owner') {
			conditions.push(`v.owner_id = $${index}`)
			values.push(userId)
			index += 1
		}

		if (filters.status) {
			conditions.push(`b.status = $${index}`)
			values.push(filters.status)
			index += 1
		}

		if (filters.search) {
			conditions.push(
				`(v.name ILIKE $${index} OR u.username ILIKE $${index} OR u.first_name ILIKE $${index} OR u.last_name ILIKE $${index})`,
			)
			values.push(`%${filters.search}%`)
			index += 1
		}

		const page = filters.page && filters.page > 0 ? filters.page : 1
		const limit = filters.limit && filters.limit > 0 ? filters.limit : 10
		const offset = (page - 1) * limit
		const sortBy = [
			'booking_date',
			'guest_count',
			'total_price',
			'advance_amount',
			'created_at',
		].includes(filters.sortBy || '')
			? filters.sortBy!
			: 'created_at'
		const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC'

		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
		const countQuery = `SELECT COUNT(*)::int AS total FROM bookings b INNER JOIN venues v ON v.id = b.venue_id INNER JOIN users u ON u.id = b.customer_id ${whereClause}`
		const listQuery = `
			SELECT
				b.id,
				b.venue_id AS "venueId",
				v.name AS "venueName",
				b.customer_id AS "customerId",
				COALESCE(u.first_name || ' ' || u.last_name, u.username) AS "customerName",
				b.booking_date AS "bookingDate",
				b.guest_count AS "guestCount",
				b.total_price AS "totalPrice",
				b.advance_amount AS "advanceAmount",
				b.status,
				b.created_at AS "createdAt"
			FROM bookings b
			INNER JOIN venues v ON v.id = b.venue_id
			INNER JOIN users u ON u.id = b.customer_id
			${whereClause}
			ORDER BY b.${sortBy} ${sortOrder}
			LIMIT $${index} OFFSET $${index + 1}
		`

		const countResult = await pool.query<{ total: number }>(countQuery, values)
		const listResult = await pool.query<BookingListItem>(listQuery, [
			...values,
			limit,
			offset,
		])

		return { items: listResult.rows, total: countResult.rows[0]?.total || 0 }
	}

	public async findBookingById(
		bookingId: number,
	): Promise<BookingEntity | null> {
		const result = await pool.query<BookingEntity>(
			'SELECT id, venue_id, customer_id, booking_date, guest_count, total_price, advance_amount, status, created_at FROM bookings WHERE id = $1 LIMIT 1',
			[bookingId],
		)
		return result.rows[0] || null
	}

	public async updateBookingStatus(
		bookingId: number,
		status: BookingEntity['status'],
	): Promise<BookingEntity | null> {
		const result = await pool.query<BookingEntity>(
			'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, venue_id, customer_id, booking_date, guest_count, total_price, advance_amount, status, created_at',
			[status, bookingId],
		)
		return result.rows[0] || null
	}

	public async deleteBooking(bookingId: number): Promise<boolean> {
		const result = await pool.query(
			'DELETE FROM bookings WHERE id = $1 RETURNING id',
			[bookingId],
		)
		return (result.rowCount ?? 0) > 0
	}
}
