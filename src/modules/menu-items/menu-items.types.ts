export interface MenuItemEntity {
	id: number
	venue_id: number
	name: string
	image_url: string | null
}

export interface SafeMenuItem {
	id: number
	venueId: number
	name: string
	imageUrl: string | null
}

export interface CreateMenuItemRequestBody {
	venueId: number
	name: string
	imageUrl?: string | null
}

export interface UpdateMenuItemRequestBody {
	name?: string
	imageUrl?: string | null
}
