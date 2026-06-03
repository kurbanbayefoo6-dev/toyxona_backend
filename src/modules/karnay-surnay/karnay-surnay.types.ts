export interface KarnaySurnayEntity {
	id: number
	venue_id: number
	is_available: boolean
	price: number
}

export interface SafeKarnaySurnay {
	id: number
	venueId: number
	isAvailable: boolean
	price: number
}

export interface CreateKarnaySurnayRequestBody {
	venueId: number
	isAvailable: boolean
	price: number
}

export interface UpdateKarnaySurnayRequestBody {
	isAvailable?: boolean
	price?: number
}
