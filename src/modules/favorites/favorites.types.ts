export interface FavoriteEntity {
	id: number
	user_id: number
	venue_id: number
	created_at: Date
}

import type { SafeVenue } from '../venues/venues.types'

export interface SafeFavorite {
	id: number
	userId: number
	venueId: number
	createdAt: Date
	venue: SafeVenue | null
}
