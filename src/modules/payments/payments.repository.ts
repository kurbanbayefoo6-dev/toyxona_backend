import { QueryResult } from 'pg'

import { pool } from '../../config/db'
import { coerceId } from '../../utils/coerceId'
import {
	PaymentEntity,
	PaymentListFilters,
	PaymentListItem,
} from './payments.types'

export class PaymentsRepository {
	public async findBookingById(bookingId: number): Promise<{
		id: number
		venue_id: number
		customer_id: number
		booking_date: string
		total_price: number
		advance_amount: number
		status: string
	} | null> {
		const result = await pool.query<{
			id: number
			venue_id: number
			customer_id: number
			booking_date: string
			total_price: number
			advance_amount: number
			status: string
		}>(
			'SELECT id, venue_id, customer_id, booking_date, total_price, advance_amount, status FROM bookings WHERE id = $1 LIMIT 1',
			[bookingId],
		)
		const row = result.rows[0]
		if (!row) return null

		return {
			id: coerceId(row.id),
			venue_id: coerceId(row.venue_id),
			customer_id: coerceId(row.customer_id),
			booking_date: row.booking_date,
			total_price: Number(row.total_price),
			advance_amount: Number(row.advance_amount),
			status: row.status,
		}
	}

	public async hasPaidPayment(
		bookingId: number,
		paymentType: 'advance' | 'full',
	): Promise<boolean> {
		const result = await pool.query(
			`SELECT id FROM payments
			 WHERE booking_id = $1 AND payment_type = $2 AND payment_status = 'paid'
			 LIMIT 1`,
			[bookingId, paymentType],
		)
		return (result.rowCount ?? 0) > 0
	}

	public async countPaidAmountForBooking(bookingId: number): Promise<number> {
		const result = await pool.query<{ total: string | number }>(
			"SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE booking_id = $1 AND payment_status = 'paid'",
			[bookingId],
		)
		return Number(result.rows[0]?.total || 0)
	}

	public async createPaymentRecord(payload: {
		bookingId: number
		transactionId: string
		amount: number
		paymentType: 'advance' | 'full'
	}): Promise<PaymentEntity> {
		const result: QueryResult<PaymentEntity> = await pool.query(
			`INSERT INTO payments (booking_id, transaction_id, amount, payment_type, payment_status, paid_at)
			 VALUES ($1, $2, $3, $4, 'paid', NOW())
			 RETURNING id, booking_id, transaction_id, amount, payment_type, payment_status, paid_at, created_at`,
			[
				payload.bookingId,
				payload.transactionId,
				payload.amount,
				payload.paymentType,
			],
		)
		return result.rows[0]
	}

	public async listPayments(
		userRole: 'admin' | 'owner' | 'customer',
		userId: number,
		filters: PaymentListFilters,
	): Promise<{ items: PaymentListItem[]; total: number }> {
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

		if (filters.search) {
			conditions.push(
				`(p.transaction_id ILIKE $${index} OR v.name ILIKE $${index} OR u.username ILIKE $${index})`,
			)
			values.push(`%${filters.search}%`)
			index += 1
		}

		const page = filters.page && filters.page > 0 ? filters.page : 1
		const limit = filters.limit && filters.limit > 0 ? filters.limit : 10
		const offset = (page - 1) * limit
		const sortBy = [
			'created_at',
			'paid_at',
			'amount',
			'transaction_id',
		].includes(filters.sortBy || '')
			? filters.sortBy!
			: 'created_at'
		const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC'

		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
		const countResult = await pool.query<{ total: number }>(
			`SELECT COUNT(*)::int AS total FROM payments p INNER JOIN bookings b ON b.id = p.booking_id INNER JOIN venues v ON v.id = b.venue_id INNER JOIN users u ON u.id = b.customer_id ${whereClause}`,
			values,
		)
		const listResult = await pool.query<PaymentListItem>(
			`
			SELECT
				p.id,
				p.booking_id AS "bookingId",
				p.transaction_id AS "transactionId",
				p.amount,
				p.payment_type AS "paymentType",
				p.payment_status AS "paymentStatus",
				p.paid_at AS "paidAt",
				p.created_at AS "createdAt",
				b.booking_date AS "bookingDate",
				v.name AS "venueName",
				COALESCE(u.first_name || ' ' || u.last_name, u.username) AS "customerName"
			FROM payments p
			INNER JOIN bookings b ON b.id = p.booking_id
			INNER JOIN venues v ON v.id = b.venue_id
			INNER JOIN users u ON u.id = b.customer_id
			${whereClause}
			ORDER BY p.${sortBy} ${sortOrder}
			LIMIT $${index} OFFSET $${index + 1}
			`,
			[...values, limit, offset],
		)

		return { items: listResult.rows, total: countResult.rows[0]?.total || 0 }
	}
}
