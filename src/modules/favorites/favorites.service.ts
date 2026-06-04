import { AppError } from '../../middleware/error.middleware'
import { mapToSafeVenue } from '../venues/venues.mapper'
import { VenuesRepository } from '../venues/venues.repository'
import { FavoritesRepository } from './favorites.repository'
import { FavoriteEntity, SafeFavorite } from './favorites.types'

export class FavoritesService {
	constructor(
		private readonly favoritesRepository: FavoritesRepository,
		private readonly venuesRepository: VenuesRepository,
	) {}

	public async addFavorite(
		userId: number,
		venueId: number,
	): Promise<SafeFavorite> {
		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		if (venue.status !== 'approved') {
			throw new AppError('Venue not found', 404)
		}

		const isAlreadyFavorite =
			await this.favoritesRepository.isFavorite(userId, venueId)
		if (isAlreadyFavorite) {
			throw new AppError('Venue already in favorites', 409)
		}

		const favorite = await this.favoritesRepository.createFavorite(
			userId,
			venueId,
		)
		return this.toSafe(favorite, null)
	}

	public async removeFavorite(
		userId: number,
		venueId: number,
	): Promise<void> {
		const isFavorite = await this.favoritesRepository.isFavorite(
			userId,
			venueId,
		)
		if (!isFavorite) {
			throw new AppError('Venue not in favorites', 404)
		}

		await this.favoritesRepository.deleteFavorite(userId, venueId)
	}

	public async getUserFavorites(userId: number): Promise<SafeFavorite[]> {
		const favorites = await this.favoritesRepository.getUserFavorites(userId)
		if (favorites.length === 0) {
			return []
		}

		const venueIds = [...new Set(favorites.map(fav => fav.venue_id))]
		const imagesByVenueId =
			await this.venuesRepository.getVenueImagesByVenueIds(venueIds)

		return Promise.all(
			favorites.map(async favorite => {
				const venue = await this.venuesRepository.findById(favorite.venue_id)
				const safeVenue = venue
					? mapToSafeVenue(
							venue,
							imagesByVenueId.get(venue.id) ?? [],
						)
					: null

				return {
					id: favorite.id,
					userId: favorite.user_id,
					venueId: favorite.venue_id,
					createdAt: favorite.created_at,
					venue: safeVenue,
				}
			}),
		)
	}

	private toSafe(
		favorite: FavoriteEntity,
		venue: SafeFavorite['venue'] = null,
	): SafeFavorite {
		return {
			id: favorite.id,
			userId: favorite.user_id,
			venueId: favorite.venue_id,
			createdAt: favorite.created_at,
			venue,
		}
	}
}
