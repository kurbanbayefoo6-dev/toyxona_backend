export interface FavoriteEntity {
	id: number
	user_id: number
	venue_id: number
	created_at: Date
}

export interface SafeFavorite {
	id: number
	userId: number
	venueId: number
	createdAt: Date
}
