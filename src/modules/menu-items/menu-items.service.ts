import { AppError } from '../../middleware/error.middleware'
import { idsEqual } from '../../utils/coerceId'
import { VenuesRepository } from '../venues/venues.repository'
import { MenuItemsRepository } from './menu-items.repository'
import {
	CreateMenuItemRequestBody,
	SafeMenuItem,
	UpdateMenuItemRequestBody,
} from './menu-items.types'

export class MenuItemsService {
	constructor(
		private readonly menuItemsRepository: MenuItemsRepository,
		private readonly venuesRepository: VenuesRepository,
	) {}

	public async createItem(
		userId: number,
		role: 'admin' | 'owner',
		payload: CreateMenuItemRequestBody,
	): Promise<SafeMenuItem> {
		if (!payload.venueId || !payload.name) {
			throw new AppError('Venue id and name are required', 400)
		}

		const venue = await this.venuesRepository.findById(payload.venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}
		if (role === 'owner' && !idsEqual(venue.owner_id, userId)) {
			throw new AppError('Forbidden', 403)
		}

		const item = await this.menuItemsRepository.create(payload)
		return this.toSafe(item)
	}

	public async getItems(
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
		venueId?: number,
	): Promise<SafeMenuItem[]> {
		if (venueId) {
			const venue = await this.venuesRepository.findById(venueId)
			if (!venue) {
				throw new AppError('Venue not found', 404)
			}
			if (!userRole && venue.status !== 'approved') {
				throw new AppError('Venue not found', 404)
			}
			if (userRole === 'owner' && !idsEqual(venue.owner_id, userId)) {
				throw new AppError('Forbidden', 403)
			}
			const items = await this.menuItemsRepository.listByVenueIds([venueId])
			return items.map(item => this.toSafe(item))
		}

		if (userRole === 'owner' && userId) {
			const venues = await this.venuesRepository.listVenues({}, 'owner', userId)
			const items = await this.menuItemsRepository.listByVenueIds(
				venues.items.map(venue => venue.id),
			)
			return items.map(item => this.toSafe(item))
		}

		if (!userRole || userRole === 'customer') {
			const venues = await this.venuesRepository.listVenues(
				{},
				'customer',
				userId,
			)
			const items = await this.menuItemsRepository.listByVenueIds(
				venues.items.map(venue => venue.id),
			)
			return items.map(item => this.toSafe(item))
		}

		const items = await this.menuItemsRepository.listByVenueIds()
		return items.map(item => this.toSafe(item))
	}

	public async updateItem(
		userId: number,
		role: 'admin' | 'owner',
		id: number,
		payload: UpdateMenuItemRequestBody,
	): Promise<SafeMenuItem> {
		const item = await this.menuItemsRepository.findById(id)
		if (!item) {
			throw new AppError('Menu item not found', 404)
		}
		const venue = await this.venuesRepository.findById(item.venue_id)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}
		if (role === 'owner' && !idsEqual(venue.owner_id, userId)) {
			throw new AppError('Forbidden', 403)
		}
		const updated = await this.menuItemsRepository.update(id, payload)
		if (!updated) {
			throw new AppError('Menu item not found', 404)
		}
		return this.toSafe(updated)
	}

	public async deleteItem(
		userId: number,
		role: 'admin' | 'owner',
		id: number,
	): Promise<void> {
		const item = await this.menuItemsRepository.findById(id)
		if (!item) {
			throw new AppError('Menu item not found', 404)
		}
		const venue = await this.venuesRepository.findById(item.venue_id)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}
		if (role === 'owner' && !idsEqual(venue.owner_id, userId)) {
			throw new AppError('Forbidden', 403)
		}
		const deleted = await this.menuItemsRepository.delete(id)
		if (!deleted) {
			throw new AppError('Menu item not found', 404)
		}
	}

	public async getItemById(
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
		id?: number,
	): Promise<SafeMenuItem> {
		if (!id) {
			throw new AppError('Invalid menu item id', 400)
		}
		const item = await this.menuItemsRepository.findById(id)
		if (!item) {
			throw new AppError('Menu item not found', 404)
		}
		const venue = await this.venuesRepository.findById(item.venue_id)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}
		if (!userRole && venue.status !== 'approved') {
			throw new AppError('Menu item not found', 404)
		}
		if (userRole === 'owner' && !idsEqual(venue.owner_id, userId)) {
			throw new AppError('Forbidden', 403)
		}
		return this.toSafe(item)
	}

	private toSafe(item: {
		id: number
		venue_id: number
		name: string
		image_url: string | null
	}): SafeMenuItem {
		return {
			id: item.id,
			venueId: item.venue_id,
			name: item.name,
			imageUrl: item.image_url,
		}
	}
}
