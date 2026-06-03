export interface ReviewEntity {
	id: number
	user_id: number
	venue_id: number
	rating: number
	comment: string
	created_at: Date
}

export interface SafeReview {
	id: number
	userId: number
	venueId: number
	rating: number
	comment: string
	createdAt: Date
}

export interface CreateReviewRequestBody {
	venueId: number
	rating: number
	comment: string
}

export interface UpdateReviewRequestBody {
	rating?: number
	comment?: string
}
