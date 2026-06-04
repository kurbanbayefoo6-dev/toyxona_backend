export type VenueStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'admin' | 'owner' | 'customer'

export interface VenueEntity {
	id: number
	owner_id: number
	name: string
	district: string
	address: string
	capacity: number
	price_per_seat: number
	phone: string
	status: VenueStatus
	created_at: Date
}

export interface SafeVenue {
	id: number
	ownerId: number
	name: string
	district: string
	address: string
	capacity: number
	pricePerSeat: number
	phone: string
	status: VenueStatus
	createdAt: Date
}

export interface CreateVenueRequestBody {
	name: string
	district: string
	address: string
	capacity: number
	pricePerSeat: number
	phone: string
}

export interface UpdateVenueRequestBody {
	name?: string
	district?: string
	address?: string
	capacity?: number
	pricePerSeat?: number
	phone?: string
}

export interface UpdateVenueStatusRequestBody {
	status: Exclude<VenueStatus, 'pending'>
}

export interface VenueFilters {
	district?: string
	capacity?: number
	minPrice?: number
	maxPrice?: number
	search?: string
	page?: number
	limit?: number
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
}

export interface PaginatedVenuesResponse {
	items: SafeVenue[]
	total: number
	page: number
	limit: number
	totalPages: number
}

export interface VenueAvailabilityResponse {
	availableDates: string[]
	bookedDates: string[]
	pastDates: string[]
}

export interface VenueFullResponse {
	venue: SafeVenue
	images: Array<{ id: number; imageUrl: string }>
	singers: Array<{ id: number; name: string; price: number; imageUrl: string | null }>
	menuItems: Array<{ id: number; name: string; imageUrl: string | null }>
	cars: Array<{ id: number; brand: string; price: number; imageUrl: string | null }>
	karnaySurnay: Array<{ id: number; isAvailable: boolean; price: number }>
	availability: VenueAvailabilityResponse
}

export interface VenueBookingCalendarResponse {
	bookingId: number
	bookingDate: string
	customerName: string
	customerPhone: string
	guestCount: number
	status: 'upcoming' | 'completed' | 'cancelled'
}
