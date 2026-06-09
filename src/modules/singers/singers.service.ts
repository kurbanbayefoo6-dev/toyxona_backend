import { AppError } from '../../middleware/error.middleware'
import { idsEqual } from '../../utils/coerceId'
import { VenuesRepository } from '../venues/venues.repository'
import { SingersRepository } from './singers.repository'
import {
	CreateSingerRequestBody,
	SafeSinger,
	UpdateSingerRequestBody,
} from './singers.types'

export class SingersService {
	constructor(
		private readonly singersRepository: SingersRepository,
		private readonly venuesRepository: VenuesRepository,
	) {}

	public async create(
		userId: number,
		role: 'admin' | 'owner',
		payload: CreateSingerRequestBody,
	): Promise<SafeSinger> {
		if (!payload.venueId || !payload.name)
			throw new AppError('Venue id, name and price are required', 400)
		const venue = await this.venuesRepository.findById(payload.venueId)
		if (!venue) throw new AppError('Venue not found', 404)
		if (role === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		const singer = await this.singersRepository.create(payload)
		return this.toSafe(singer)
	}

	public async getAll(
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
		venueId?: number,
	): Promise<SafeSinger[]> {
		if (venueId) {
			const venue = await this.venuesRepository.findById(venueId)
			if (!venue) throw new AppError('Venue not found', 404)
			if (!userRole && venue.status !== 'approved')
				throw new AppError('Venue not found', 404)
			if (userRole === 'owner' && !idsEqual(venue.owner_id, userId))
				throw new AppError('Forbidden', 403)
			const singers = await this.singersRepository.listByVenueIds([venueId])
			return singers.map(singer => this.toSafe(singer))
		}
		if (userRole === 'owner' && userId) {
			const venues = await this.venuesRepository.listVenues({}, 'owner', userId)
			const singers = await this.singersRepository.listByVenueIds(
				venues.items.map(venue => venue.id),
			)
			return singers.map(singer => this.toSafe(singer))
		}
		if (!userRole || userRole === 'customer') {
			const venues = await this.venuesRepository.listVenues(
				{},
				'customer',
				userId,
			)
			const singers = await this.singersRepository.listByVenueIds(
				venues.items.map(venue => venue.id),
			)
			return singers.map(singer => this.toSafe(singer))
		}
		const singers = await this.singersRepository.listByVenueIds()
		return singers.map(singer => this.toSafe(singer))
	}

	public async getById(
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
		id?: number,
	): Promise<SafeSinger> {
		if (!id) throw new AppError('Invalid singer id', 400)
		const singer = await this.singersRepository.findById(id)
		if (!singer) throw new AppError('Singer not found', 404)
		const venue = await this.venuesRepository.findById(singer.venue_id)
		if (!venue) throw new AppError('Venue not found', 404)
		if (!userRole && venue.status !== 'approved')
			throw new AppError('Singer not found', 404)
		if (userRole === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		return this.toSafe(singer)
	}

	public async update(
		userId: number,
		role: 'admin' | 'owner',
		id: number,
		payload: UpdateSingerRequestBody,
	): Promise<SafeSinger> {
		const singer = await this.singersRepository.findById(id)
		if (!singer) throw new AppError('Singer not found', 404)
		const venue = await this.venuesRepository.findById(singer.venue_id)
		if (!venue) throw new AppError('Venue not found', 404)
		if (role === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		const updated = await this.singersRepository.update(id, payload)
		if (!updated) throw new AppError('Singer not found', 404)
		return this.toSafe(updated)
	}

	public async delete(
		userId: number,
		role: 'admin' | 'owner',
		id: number,
	): Promise<void> {
		const singer = await this.singersRepository.findById(id)
		if (!singer) throw new AppError('Singer not found', 404)
		const venue = await this.venuesRepository.findById(singer.venue_id)
		if (!venue) throw new AppError('Venue not found', 404)
		if (role === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		const deleted = await this.singersRepository.delete(id)
		if (!deleted) throw new AppError('Singer not found', 404)
	}

	private toSafe(singer: {
		id: number
		venue_id: number
		name: string
		price: number
		image_url: string | null
	}): SafeSinger {
		return {
			id: singer.id,
			venueId: singer.venue_id,
			name: singer.name,
			price: singer.price,
			imageUrl: singer.image_url,
		}
	}
}
