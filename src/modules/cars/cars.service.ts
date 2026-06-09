import { AppError } from '../../middleware/error.middleware'
import { idsEqual } from '../../utils/coerceId'
import { VenuesRepository } from '../venues/venues.repository'
import { CarsRepository } from './cars.repository'
import {
	CarEntity,
	CreateCarRequestBody,
	SafeCar,
	UpdateCarRequestBody,
} from './cars.types'

export class CarsService {
	constructor(
		private readonly carsRepository: CarsRepository,
		private readonly venuesRepository: VenuesRepository,
	) {}
	public async create(
		userId: number,
		role: 'admin' | 'owner',
		payload: CreateCarRequestBody,
	): Promise<SafeCar> {
		if (!payload.venueId || !payload.brand)
			throw new AppError('Venue id, brand and price are required', 400)
		const venue = await this.venuesRepository.findById(payload.venueId)
		if (!venue) throw new AppError('Venue not found', 404)
		if (role === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		const car = await this.carsRepository.create(payload)
		return this.toSafe(car)
	}
	public async getAll(
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
		venueId?: number,
	): Promise<SafeCar[]> {
		if (venueId) {
			const venue = await this.venuesRepository.findById(venueId)
			if (!venue) throw new AppError('Venue not found', 404)
			if (!userRole && venue.status !== 'approved')
				throw new AppError('Venue not found', 404)
			if (userRole === 'owner' && !idsEqual(venue.owner_id, userId))
				throw new AppError('Forbidden', 403)
			return (await this.carsRepository.listByVenueIds([venueId])).map(car =>
				this.toSafe(car),
			)
		}
		if (userRole === 'owner' && userId) {
			const venues = await this.venuesRepository.listVenues({}, 'owner', userId)
			return (
				await this.carsRepository.listByVenueIds(
					venues.items.map(venue => venue.id),
				)
			).map(car => this.toSafe(car))
		}
		if (!userRole || userRole === 'customer') {
			const venues = await this.venuesRepository.listVenues(
				{},
				'customer',
				userId,
			)
			return (
				await this.carsRepository.listByVenueIds(
					venues.items.map(venue => venue.id),
				)
			).map(car => this.toSafe(car))
		}
		return (await this.carsRepository.listByVenueIds()).map(car =>
			this.toSafe(car),
		)
	}
	public async getById(
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
		id?: number,
	): Promise<SafeCar> {
		if (!id) throw new AppError('Invalid car id', 400)
		const car = await this.carsRepository.findById(id)
		if (!car) throw new AppError('Car not found', 404)
		const venue = await this.venuesRepository.findById(car.venue_id)
		if (!venue) throw new AppError('Venue not found', 404)
		if (!userRole && venue.status !== 'approved')
			throw new AppError('Car not found', 404)
		if (userRole === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		return this.toSafe(car)
	}
	public async update(
		userId: number,
		role: 'admin' | 'owner',
		id: number,
		payload: UpdateCarRequestBody,
	): Promise<SafeCar> {
		const car = await this.carsRepository.findById(id)
		if (!car) throw new AppError('Car not found', 404)
		const venue = await this.venuesRepository.findById(car.venue_id)
		if (!venue) throw new AppError('Venue not found', 404)
		if (role === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		const updated = await this.carsRepository.update(id, payload)
		if (!updated) throw new AppError('Car not found', 404)
		return this.toSafe(updated)
	}
	public async delete(
		userId: number,
		role: 'admin' | 'owner',
		id: number,
	): Promise<void> {
		const car = await this.carsRepository.findById(id)
		if (!car) throw new AppError('Car not found', 404)
		const venue = await this.venuesRepository.findById(car.venue_id)
		if (!venue) throw new AppError('Venue not found', 404)
		if (role === 'owner' && !idsEqual(venue.owner_id, userId))
			throw new AppError('Forbidden', 403)
		const deleted = await this.carsRepository.delete(id)
		if (!deleted) throw new AppError('Car not found', 404)
	}
	private toSafe(car: CarEntity): SafeCar {
		return {
			id: car.id,
			venueId: car.venue_id,
			brand: car.brand,
			price: car.price,
			imageUrl: car.image_url,
		}
	}
}
