export type PaymentType = 'advance' | 'full'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface PaymentEntity {
	id: number
	booking_id: number
	transaction_id: string
	amount: number
	payment_type: PaymentType
	payment_status: PaymentStatus
	paid_at: Date | null
	created_at: Date
}

export interface PaymentListItem {
	id: number
	bookingId: number
	transactionId: string
	amount: number
	paymentType: PaymentType
	paymentStatus: PaymentStatus
	paidAt: Date | null
	createdAt: Date
	bookingDate: string
	venueName: string
	customerName: string
}

export interface SafePayment {
	id: number
	bookingId: number
	transactionId: string
	amount: number
	paymentType: PaymentType
	paymentStatus: PaymentStatus
	paidAt: Date | null
	createdAt: Date
}

export interface CreatePaymentRequestBody {
	bookingId: number
	paymentType: PaymentType
}

export interface PaymentListFilters {
	search?: string
	page?: number
	limit?: number
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
}
