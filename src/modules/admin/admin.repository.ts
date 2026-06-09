import { pool } from '../../config/db'
import { AdminListFilters, DashboardSummary } from './admin.types'

export class AdminRepository {
	public async getDashboardSummary(): Promise<DashboardSummary> {
		const [users, venues, bookings, revenue] = await Promise.all([
			pool.query<{ total: number; owners: number; customers: number }>(
				`
				SELECT
					COUNT(*)::int AS total,
					COUNT(*) FILTER (WHERE role = 'owner')::int AS owners,
					COUNT(*) FILTER (WHERE role = 'customer')::int AS customers
				FROM users
				`,
			),
			pool.query<{ total: number; approved: number; pending: number }>(
				`
				SELECT
					COUNT(*)::int AS total,
					COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
					COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
				FROM venues
				`,
			),
			pool.query<{
				total: number
				completed: number
				upcoming: number
				cancelled: number
			}>(
				`
				SELECT
					COUNT(*)::int AS total,
					COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
					COUNT(*) FILTER (WHERE status = 'upcoming')::int AS upcoming,
					COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
				FROM bookings
				`,
			),
			pool.query<{ revenue: string | number }>(
				"SELECT COALESCE(SUM(amount), 0) AS revenue FROM payments WHERE payment_status = 'paid'",
			),
		])

		return {
			totalUsers: users.rows[0]?.total || 0,
			totalOwners: users.rows[0]?.owners || 0,
			totalCustomers: users.rows[0]?.customers || 0,
			totalVenues: venues.rows[0]?.total || 0,
			approvedVenues: venues.rows[0]?.approved || 0,
			pendingVenues: venues.rows[0]?.pending || 0,
			totalBookings: bookings.rows[0]?.total || 0,
			completedBookings: bookings.rows[0]?.completed || 0,
			upcomingBookings: bookings.rows[0]?.upcoming || 0,
			cancelledBookings: bookings.rows[0]?.cancelled || 0,
			totalRevenue: Number(revenue.rows[0]?.revenue || 0),
		}
	}

	public async listUsers(
		filters: AdminListFilters,
		role?: 'admin' | 'owner' | 'customer',
	): Promise<{ items: Array<Record<string, unknown>>; total: number }> {
		const conditions: string[] = []
		const values: Array<string | number> = []
		let index = 1

		if (role) {
			conditions.push(`role = $${index}`)
			values.push(role)
			index += 1
		}

		if (filters.search) {
			conditions.push(
				`(username ILIKE $${index} OR email ILIKE $${index} OR first_name ILIKE $${index} OR last_name ILIKE $${index})`,
			)
			values.push(`%${filters.search}%`)
			index += 1
		}

		const page = filters.page && filters.page > 0 ? filters.page : 1
		const limit = filters.limit && filters.limit > 0 ? filters.limit : 10
		const offset = (page - 1) * limit
		const sortBy = [
			'created_at',
			'first_name',
			'last_name',
			'email',
			'username',
			'role',
		].includes(filters.sortBy || '')
			? filters.sortBy!
			: 'created_at'
		const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC'
		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

		const countResult = await pool.query<{ total: number }>(
			`SELECT COUNT(*)::int AS total FROM users ${whereClause}`,
			values,
		)
		const listResult = await pool.query(
			`
			SELECT id, first_name AS "firstName", last_name AS "lastName", username, email, phone, role, is_verified AS "isVerified", created_at AS "createdAt"
			FROM users
			${whereClause}
			ORDER BY ${sortBy} ${sortOrder}
			LIMIT $${index} OFFSET $${index + 1}
			`,
			[...values, limit, offset],
		)

		return { items: listResult.rows, total: countResult.rows[0]?.total || 0 }
	}

	public async listVenues(
		filters: AdminListFilters,
	): Promise<{ items: Array<Record<string, unknown>>; total: number }> {
		const conditions: string[] = []
		const values: Array<string | number> = []
		let index = 1

		if (filters.status) {
			conditions.push(`status = $${index}`)
			values.push(filters.status)
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
		const sortBy = [
			'created_at',
			'name',
			'district',
			'capacity',
			'price_per_seat',
			'status',
		].includes(filters.sortBy || '')
			? filters.sortBy!
			: 'created_at'
		const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC'
		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

		const countResult = await pool.query<{ total: number }>(
			`SELECT COUNT(*)::int AS total FROM venues ${whereClause}`,
			values,
		)
		const listResult = await pool.query(
			`
			SELECT
				v.id,
				v.owner_id AS "ownerId",
				v.name,
				v.district,
				v.address,
				v.capacity,
				v.price_per_seat AS "pricePerSeat",
				v.phone,
				v.status,
				v.created_at AS "createdAt",
				vi.image_url AS "imageUrl",
				vi.image_url AS "coverImage",
				vi.image_url AS "image"
			FROM venues v
			LEFT JOIN LATERAL (
				SELECT image_url
				FROM venue_images
				WHERE venue_id = v.id
				ORDER BY id DESC
				LIMIT 1
			) vi ON true
			${whereClause}
			ORDER BY v.${sortBy} ${sortOrder}
			LIMIT $${index} OFFSET $${index + 1}
			`,
			[...values, limit, offset],
		)

		return { items: listResult.rows, total: countResult.rows[0]?.total || 0 }
	}

	public async listBookings(
		filters: AdminListFilters,
	): Promise<{ items: Array<Record<string, unknown>>; total: number }> {
		const conditions: string[] = []
		const values: Array<string | number> = []
		let index = 1

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
			'created_at',
			'booking_date',
			'guest_count',
			'total_price',
			'advance_amount',
			'status',
		].includes(filters.sortBy || '')
			? filters.sortBy!
			: 'created_at'
		const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC'
		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

		const countResult = await pool.query<{ total: number }>(
			`SELECT COUNT(*)::int AS total FROM bookings b INNER JOIN venues v ON v.id = b.venue_id INNER JOIN users u ON u.id = b.customer_id ${whereClause}`,
			values,
		)
		const listResult = await pool.query(
			`
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
			`,
			[...values, limit, offset],
		)

		return { items: listResult.rows, total: countResult.rows[0]?.total || 0 }
	}
}
