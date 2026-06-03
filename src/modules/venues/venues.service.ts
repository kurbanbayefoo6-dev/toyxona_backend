import { AppError } from '../../middleware/error.middleware'
import { VenuesRepository } from './venues.repository'
import {
	CreateVenueRequestBody,
	PaginatedVenuesResponse,
	SafeVenue,
	UpdateVenueRequestBody,
	UpdateVenueStatusRequestBody,
	VenueEntity,
	VenueFilters,
} from './venues.types'

export class VenuesService {
	constructor(private readonly venuesRepository: VenuesRepository) {}

	public async createVenue(
		ownerId: number,
		role: 'admin' | 'owner',
		payload: CreateVenueRequestBody,
	): Promise<SafeVenue> {
		if (role !== 'owner' && role !== 'admin') {
			throw new AppError('Forbidden', 403)
		}

		this.validateVenuePayload(payload)
		const venue = await this.venuesRepository.createVenue(ownerId, payload)
		return this.toSafeVenue(venue)
	}

	public async getVenues(
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
		filters: VenueFilters = {},
	): Promise<PaginatedVenuesResponse> {
		const result = await this.venuesRepository.listVenues(
			filters,
			userRole,
			userId,
		)
		const page = filters.page && filters.page > 0 ? filters.page : 1
		const limit = filters.limit && filters.limit > 0 ? filters.limit : 10

		return {
			items: result.items.map(item => this.toSafeVenue(item)),
			total: result.total,
			page,
			limit,
			totalPages: Math.max(1, Math.ceil(result.total / limit)),
		}
	}

	public async getVenueById(
		userRole: 'admin' | 'owner' | 'customer' | undefined,
		userId: number | undefined,
		venueId: number,
	): Promise<SafeVenue> {
		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		if (userRole === 'admin') {
			return this.toSafeVenue(venue)
		}

		if (userRole === 'owner' && userId === venue.owner_id) {
			return this.toSafeVenue(venue)
		}

		if (venue.status !== 'approved') {
			throw new AppError('Venue not found', 404)
		}

		return this.toSafeVenue(venue)
	}

	public async updateVenue(
		userRole: 'admin' | 'owner',
		userId: number,
		venueId: number,
		payload: UpdateVenueRequestBody,
	): Promise<SafeVenue> {
		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		this.ensureCanManageVenue(userRole, userId, venue)
		this.validateVenueUpdatePayload(payload)

		const updatedVenue = await this.venuesRepository.updateVenue(
			venueId,
			payload,
		)
		if (!updatedVenue) {
			throw new AppError('Venue not found', 404)
		}

		return this.toSafeVenue(updatedVenue)
	}

	public async deleteVenue(
		userRole: 'admin' | 'owner',
		userId: number,
		venueId: number,
	): Promise<void> {
		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		this.ensureCanManageVenue(userRole, userId, venue)
		const deleted = await this.venuesRepository.deleteVenue(venueId)
		if (!deleted) {
			throw new AppError('Venue not found', 404)
		}
	}

	public async updateVenueStatus(
		userRole: 'admin',
		venueId: number,
		payload: UpdateVenueStatusRequestBody,
	): Promise<SafeVenue> {
		if (userRole !== 'admin') {
			throw new AppError('Forbidden', 403)
		}

		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		const updatedVenue = await this.venuesRepository.updateVenueStatus(
			venueId,
			payload,
		)
		if (!updatedVenue) {
			throw new AppError('Venue not found', 404)
		}

		return this.toSafeVenue(updatedVenue)
	}

	private ensureCanManageVenue(
		userRole: 'admin' | 'owner',
		userId: number,
		venue: VenueEntity,
	): void {
		if (userRole === 'admin') {
			return
		}

		if (venue.owner_id !== userId) {
			throw new AppError('Forbidden', 403)
		}
	}

	private validateVenuePayload(payload: CreateVenueRequestBody): void {
		const required = [
			payload.name,
			payload.district,
			payload.address,
			payload.phone,
		]
		if (required.some(value => !value || value.trim().length === 0)) {
			throw new AppError('All venue fields are required', 400)
		}
		if (Number(payload.capacity) <= 0 || Number(payload.pricePerSeat) < 0) {
			throw new AppError('Invalid venue numeric values', 400)
		}
	}

	private validateVenueUpdatePayload(payload: UpdateVenueRequestBody): void {
		const hasAny = Object.values(payload).some(value => value !== undefined)
		if (!hasAny) {
			throw new AppError('At least one field is required', 400)
		}
	}

	private toSafeVenue(venue: VenueEntity): SafeVenue {
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
		}
	}
}
