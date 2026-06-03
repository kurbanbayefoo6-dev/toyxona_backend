import { AppError } from '../../middleware/error.middleware'
import { CarsRepository } from '../cars/cars.repository'
import { KarnaySurnayRepository } from '../karnay-surnay/karnay-surnay.repository'
import { SingersRepository } from '../singers/singers.repository'
import { VenuesRepository } from '../venues/venues.repository'
import { BookingsRepository } from './bookings.repository'
import {
	BookingFilters,
	BookingStatus,
	CreateBookingRequestBody,
	DeleteBookingRequestBody,
	SafeBooking,
	UpdateBookingRequestBody,
} from './bookings.types'

export class BookingsService {
	constructor(
		private readonly bookingsRepository: BookingsRepository,
		private readonly venuesRepository: VenuesRepository,
		private readonly singersRepository: SingersRepository,
		private readonly carsRepository: CarsRepository,
		private readonly karnaySurnayRepository: KarnaySurnayRepository,
	) {}

	public async createBooking(
		customerId: number,
		role: 'customer',
		payload: CreateBookingRequestBody,
	): Promise<SafeBooking> {
		if (role !== 'customer') {
			throw new AppError('Only customers can create bookings', 403)
		}

		this.validateCreatePayload(payload)

		const venue = await this.venuesRepository.findById(payload.venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}
		if (venue.status !== 'approved') {
			throw new AppError('Venue is not approved', 400)
		}

		const singerIds = this.uniqueIds(payload.singerIds)
		const carIds = this.uniqueIds(payload.carIds)
		const karnaySurnayIds = this.uniqueIds(payload.karnaySurnayIds)

		const singers =
			singerIds.length > 0
				? await this.singersRepository
						.listByVenueIds([payload.venueId])
						.then(items => items.filter(item => singerIds.includes(item.id)))
				: []
		const cars =
			carIds.length > 0
				? await this.carsRepository
						.listByVenueIds([payload.venueId])
						.then(items => items.filter(item => carIds.includes(item.id)))
				: []
		const karnayItems =
			karnaySurnayIds.length > 0
				? await this.karnaySurnayRepository
						.listByVenueIds([payload.venueId])
						.then(items =>
							items.filter(item => karnaySurnayIds.includes(item.id)),
						)
				: []

		if (singers.length !== singerIds.length)
			throw new AppError('Invalid singer selection', 400)
		if (cars.length !== carIds.length)
			throw new AppError('Invalid car selection', 400)
		if (karnayItems.length !== karnaySurnayIds.length)
			throw new AppError('Invalid karnay surnay selection', 400)

		const venueCost = venue.price_per_seat * payload.guestCount
		const singersCost = singers.reduce((sum, item) => sum + item.price, 0)
		const carsCost = cars.reduce((sum, item) => sum + item.price, 0)
		const karnaySurnayCost = karnayItems.reduce(
			(sum, item) => sum + item.price,
			0,
		)
		const totalPrice = venueCost + singersCost + carsCost + karnaySurnayCost
		const advanceAmount = Number((totalPrice * 0.2).toFixed(2))

		const booking = await this.bookingsRepository.createBooking(customerId, {
			venueId: payload.venueId,
			bookingDate: payload.bookingDate,
			guestCount: payload.guestCount,
			totalPrice,
			advanceAmount,
			singerIds,
			carIds,
			karnaySurnayIds,
		})

		return this.toSafeBooking(booking)
	}

	public async listBookings(
		userRole: 'admin' | 'owner' | 'customer',
		userId: number,
		filters: BookingFilters,
	): Promise<{
		items: ReturnType<BookingsService['toSafeBookingListItem']>[]
		total: number
	}> {
		const result = await this.bookingsRepository.listBookings(
			userRole,
			userId,
			filters,
		)
		return {
			items: result.items.map(item => this.toSafeBookingListItem(item)),
			total: result.total,
		}
	}

	public async updateBooking(
		userRole: 'admin' | 'owner' | 'customer',
		userId: number,
		payload: UpdateBookingRequestBody,
	): Promise<SafeBooking> {
		if (!payload.bookingId || !payload.status) {
			throw new AppError('Booking id and status are required', 400)
		}

		const booking = await this.bookingsRepository.findBookingById(
			payload.bookingId,
		)
		if (!booking) {
			throw new AppError('Booking not found', 404)
		}

		const venue = await this.venuesRepository.findById(booking.venue_id)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		if (userRole === 'customer' && booking.customer_id !== userId) {
			throw new AppError('Forbidden', 403)
		}
		if (userRole === 'owner' && venue.owner_id !== userId) {
			throw new AppError('Forbidden', 403)
		}

		if (userRole === 'customer' && payload.status !== 'cancelled') {
			throw new AppError('Customers can only cancel bookings', 403)
		}

		const updated = await this.bookingsRepository.updateBookingStatus(
			payload.bookingId,
			payload.status,
		)
		if (!updated) {
			throw new AppError('Booking not found', 404)
		}

		return this.toSafeBooking(updated)
	}

	public async deleteBooking(
		userRole: 'admin',
		payload: DeleteBookingRequestBody,
	): Promise<void> {
		if (userRole !== 'admin') {
			throw new AppError('Forbidden', 403)
		}
		if (!payload.bookingId) {
			throw new AppError('Booking id is required', 400)
		}
		const deleted = await this.bookingsRepository.deleteBooking(
			payload.bookingId,
		)
		if (!deleted) {
			throw new AppError('Booking not found', 404)
		}
	}

	private validateCreatePayload(payload: CreateBookingRequestBody): void {
		if (!payload.venueId || !payload.bookingDate || !payload.guestCount) {
			throw new AppError(
				'venueId, bookingDate and guestCount are required',
				400,
			)
		}
		if (payload.guestCount <= 0) {
			throw new AppError('guestCount must be greater than 0', 400)
		}
	}

	private uniqueIds(ids?: number[]): number[] {
		return Array.from(new Set(ids || [])).filter(
			id => Number.isInteger(id) && id > 0,
		)
	}

	private toSafeBooking(booking: {
		id: number
		venue_id: number
		customer_id: number
		booking_date: string
		guest_count: number
		total_price: number
		advance_amount: number
		status: BookingStatus
		created_at: Date
	}): SafeBooking {
		return {
			id: booking.id,
			venueId: booking.venue_id,
			customerId: booking.customer_id,
			bookingDate: booking.booking_date,
			guestCount: booking.guest_count,
			totalPrice: booking.total_price,
			advanceAmount: booking.advance_amount,
			status: booking.status,
			createdAt: booking.created_at,
		}
	}

	private toSafeBookingListItem(item: {
		id: number
		venueId: number
		venueName: string
		customerId: number
		customerName: string
		bookingDate: string
		guestCount: number
		totalPrice: number
		advanceAmount: number
		status: BookingStatus
		createdAt: Date
	}) {
		return item
	}
}
