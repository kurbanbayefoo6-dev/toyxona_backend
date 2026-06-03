export interface CarEntity {
	id: number
	venue_id: number
	brand: string
	price: number
	image_url: string | null
}

export interface SafeCar {
	id: number
	venueId: number
	brand: string
	price: number
	imageUrl: string | null
}

export interface CreateCarRequestBody {
	venueId: number
	brand: string
	price: number
	imageUrl?: string | null
}

export interface UpdateCarRequestBody {
	brand?: string
	price?: number
	imageUrl?: string | null
}
