import { AppError } from '../../middleware/error.middleware'
import { BookingsRepository } from '../bookings/bookings.repository'
import { PaymentsRepository } from './payments.repository'
import { CreatePaymentRequestBody, PaymentListFilters } from './payments.types'

export class PaymentsService {
	constructor(
		private readonly paymentsRepository: PaymentsRepository,
		private readonly bookingsRepository: BookingsRepository,
	) {}

	public async createPayment(
		userId: number,
		role: 'admin' | 'owner' | 'customer',
		payload: CreatePaymentRequestBody,
	): Promise<{
		success: true
		transactionId: string
		amount: number
		message: string
	}> {
		if (role !== 'customer') {
			throw new AppError('Only customers can create payments', 403)
		}
		if (!payload.bookingId || !payload.paymentType) {
			throw new AppError('bookingId and paymentType are required', 400)
		}

		const booking = await this.paymentsRepository.findBookingById(
			payload.bookingId,
		)
		if (!booking) {
			throw new AppError('Booking not found', 404)
		}
		if (booking.customer_id !== userId) {
			throw new AppError('Forbidden', 403)
		}

		if (payload.paymentType === 'advance') {
			const advancePaid = await this.paymentsRepository.hasPaidPayment(
				payload.bookingId,
				'advance',
			)
			if (advancePaid) {
				throw new AppError('Advance payment already completed', 400)
			}
		}

		const alreadyPaid = await this.paymentsRepository.countPaidAmountForBooking(
			payload.bookingId,
		)
		const amount =
			payload.paymentType === 'advance'
				? booking.advance_amount
				: Math.max(booking.total_price - alreadyPaid, 0)

		if (amount <= 0) {
			throw new AppError('No payment amount due', 400)
		}

		if (
			payload.paymentType === 'full' &&
			alreadyPaid < booking.advance_amount
		) {
			throw new AppError('Advance payment must be completed first', 400)
		}

		const transactionId = this.generateTransactionId()
		await this.paymentsRepository.createPaymentRecord({
			bookingId: payload.bookingId,
			transactionId,
			amount,
			paymentType: payload.paymentType,
		})

		return {
			success: true,
			transactionId,
			amount,
			message: 'Payment successful',
		}
	}

	public async listPayments(
		userRole: 'admin' | 'owner' | 'customer',
		userId: number,
		filters: PaymentListFilters,
	) {
		return this.paymentsRepository.listPayments(userRole, userId, filters)
	}

	private generateTransactionId(): string {
		const now = new Date()
		const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
		const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '')
		return `TXN-${datePart}-${timePart}`
	}
}
