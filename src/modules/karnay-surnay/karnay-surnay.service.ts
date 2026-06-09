import { AppError } from '../../middleware/error.middleware'
import { idsEqual } from '../../utils/coerceId'
import { VenuesRepository } from '../venues/venues.repository'
import { KarnaySurnayRepository } from './karnay-surnay.repository'
import {
	CreateKarnaySurnayRequestBody,
	KarnaySurnayEntity,
	SafeKarnaySurnay,
	UpdateKarnaySurnayRequestBody,
} from './karnay-surnay.types'

export class KarnaySurnayService {
	constructor(
		private readonly repository: KarnaySurnayRepository,
		private readonly venuesRepository: VenuesRepository,
	) {}
	public async create(
		userId: number,
		role: 'admin' | 'owner',
		payload: CreateKarnaySurnayRequestBody,
	): Promise<SafeKarnaySurnay> {
		if (!payload.venueId) throw new AppError('Venue id is required', 400)
		const venue = await this.venuesRepository.findById(payload.venueId)
		if (!venue) throw new AppError('Venue not found', 404)
		if (role === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		const item = await this.repository.create(payload)
		return this.toSafe(item)
	}
	public async getAll(
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
		venueId?: number,
	): Promise<SafeKarnaySurnay[]> {
		if (venueId) {
			const venue = await this.venuesRepository.findById(venueId)
			if (!venue) throw new AppError('Venue not found', 404)
			if (!userRole && venue.status !== 'approved')
				throw new AppError('Venue not found', 404)
			if (userRole === 'owner' && !idsEqual(venue.owner_id, userId))
				throw new AppError('Forbidden', 403)
			return (await this.repository.listByVenueIds([venueId])).map(item =>
				this.toSafe(item),
			)
		}
		if (userRole === 'owner' && userId) {
			const venues = await this.venuesRepository.listVenues({}, 'owner', userId)
			return (
				await this.repository.listByVenueIds(
					venues.items.map(venue => venue.id),
				)
			).map(item => this.toSafe(item))
		}
		if (!userRole || userRole === 'customer') {
			const venues = await this.venuesRepository.listVenues(
				{},
				'customer',
				userId,
			)
			return (
				await this.repository.listByVenueIds(
					venues.items.map(venue => venue.id),
				)
			).map(item => this.toSafe(item))
		}
		return (await this.repository.listByVenueIds()).map(item =>
			this.toSafe(item),
		)
	}
	public async getById(
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
		id?: number,
	): Promise<SafeKarnaySurnay> {
		if (!id) throw new AppError('Invalid id', 400)
		const item = await this.repository.findById(id)
		if (!item) throw new AppError('Item not found', 404)
		const venue = await this.venuesRepository.findById(item.venue_id)
		if (!venue) throw new AppError('Venue not found', 404)
		if (!userRole && venue.status !== 'approved')
			throw new AppError('Item not found', 404)
		if (userRole === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		return this.toSafe(item)
	}
	public async update(
		userId: number,
		role: 'admin' | 'owner',
		id: number,
		payload: UpdateKarnaySurnayRequestBody,
	): Promise<SafeKarnaySurnay> {
		const item = await this.repository.findById(id)
		if (!item) throw new AppError('Item not found', 404)
		const venue = await this.venuesRepository.findById(item.venue_id)
		if (!venue) throw new AppError('Venue not found', 404)
		if (role === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		const updated = await this.repository.update(id, payload)
		if (!updated) throw new AppError('Item not found', 404)
		return this.toSafe(updated)
	}
	public async delete(
		userId: number,
		role: 'admin' | 'owner',
		id: number,
	): Promise<void> {
		const item = await this.repository.findById(id)
		if (!item) throw new AppError('Item not found', 404)
		const venue = await this.venuesRepository.findById(item.venue_id)
		if (!venue) throw new AppError('Venue not found', 404)
		if (role === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		const deleted = await this.repository.delete(id)
		if (!deleted) throw new AppError('Item not found', 404)
	}
	private toSafe(item: KarnaySurnayEntity): SafeKarnaySurnay {
		return {
			id: item.id,
			venueId: item.venue_id,
			isAvailable: item.is_available,
			price: item.price,
		}
	}
}
