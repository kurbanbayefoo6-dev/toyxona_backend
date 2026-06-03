export type BookingStatus = 'upcoming' | 'completed' | 'cancelled'

export interface BookingEntity {
	id: number
	venue_id: number
	customer_id: number
	booking_date: string
	guest_count: number
	total_price: number
	advance_amount: number
	status: BookingStatus
	created_at: Date
}

export interface BookingListItem {
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
}

export interface SafeBooking {
	id: number
	venueId: number
	customerId: number
	bookingDate: string
	guestCount: number
	totalPrice: number
	advanceAmount: number
	status: BookingStatus
	createdAt: Date
}

export interface CreateBookingRequestBody {
	venueId: number
	bookingDate: string
	guestCount: number
	singerIds?: number[]
	carIds?: number[]
	karnaySurnayIds?: number[]
}

export interface UpdateBookingRequestBody {
	bookingId: number
	status: BookingStatus
}

export interface DeleteBookingRequestBody {
	bookingId: number
}

export interface BookingFilters {
	search?: string
	status?: BookingStatus
	page?: number
	limit?: number
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
}

export interface BookingTotals {
	venueCost: number
	singersCost: number
	carsCost: number
	karnaySurnayCost: number
	totalPrice: number
	advanceAmount: number
}
