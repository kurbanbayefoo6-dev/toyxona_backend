import { normalizeStoredImageUrl } from '../../utils/normalizeImageUrl'
import { SafeVenue, SafeVenueImage, VenueEntity } from './venues.types'

export function mapToSafeVenueImage(image: {
	id: number
	venueId: number
	imageUrl: string
}): SafeVenueImage {
	return {
		id: image.id,
		venueId: image.venueId,
		imageUrl: normalizeStoredImageUrl(image.imageUrl) ?? image.imageUrl,
	}
}

export function mapToSafeVenue(
	venue: VenueEntity,
	images: Array<{ id: number; venueId?: number; imageUrl: string }> = [],
): SafeVenue {
	const safeImages: SafeVenueImage[] = images.map(img =>
		mapToSafeVenueImage({
			id: img.id,
			venueId: img.venueId ?? venue.id,
			imageUrl: img.imageUrl,
		}),
	)
	const imageUrl = safeImages[0]?.imageUrl ?? null

	return {
		id: venue.id,
		ownerId: venue.owner_id,
		name: venue.name,
		district: venue.district,
		address: venue.address,
		capacity: venue.capacity,
		pricePerSeat: venue.price_per_seat,
		phone: venue.phone,
		status: venue.status,
		createdAt: venue.created_at,
		imageUrl,
		coverImage: imageUrl,
		image: imageUrl,
		images: safeImages,
	}
}
