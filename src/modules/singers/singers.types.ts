export interface SingerEntity {
	id: number
	venue_id: number
	name: string
	price: number
	image_url: string | null
}

export interface SafeSinger {
	id: number
	venueId: number
	name: string
	price: number
	imageUrl: string | null
}

export interface CreateSingerRequestBody {
	venueId: number
	name: string
	price: number
	imageUrl?: string | null
}

export interface UpdateSingerRequestBody {
	name?: string
	price?: number
	imageUrl?: string | null
}
