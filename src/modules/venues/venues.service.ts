import { AppError } from '../../middleware/error.middleware'
import { normalizeStoredImageUrl } from '../../utils/normalizeImageUrl'
import { mapToSafeVenue } from './venues.mapper'
import { VenuesRepository } from './venues.repository'
import {
	CreateVenueRequestBody,
	PaginatedVenuesResponse,
	SafeVenue,
	UpdateVenueRequestBody,
	UpdateVenueStatusRequestBody,
	VenueAvailabilityResponse,
	VenueBookingCalendarResponse,
	VenueEntity,
	VenueFilters,
	VenueFullResponse,
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
		const assignedOwnerId =
			role === 'admin' && payload.ownerId ? Number(payload.ownerId) : ownerId
		const venue = await this.venuesRepository.createVenue(
			assignedOwnerId,
			payload,
		)
		return mapToSafeVenue(venue)
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
		const imagesByVenueId =
			await this.venuesRepository.getVenueImagesByVenueIds(
				result.items.map(item => item.id),
			)

		return {
			items: result.items.map(item =>
				mapToSafeVenue(item, imagesByVenueId.get(item.id) ?? []),
			),
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
			return this.toSafeVenueWithImages(venue)
		}

		if (userRole === 'owner' && userId === venue.owner_id) {
			return this.toSafeVenueWithImages(venue)
		}

		if (venue.status !== 'approved') {
			throw new AppError('Venue not found', 404)
		}

		return this.toSafeVenueWithImages(venue)
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
		if (userRole !== 'admin' && payload.ownerId !== undefined) {
			throw new AppError('Only admin can assign owner', 403)
		}

		const updatedVenue = await this.venuesRepository.updateVenue(
			venueId,
			payload,
		)
		if (!updatedVenue) {
			throw new AppError('Venue not found', 404)
		}

		return this.toSafeVenueWithImages(updatedVenue)
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

		return this.toSafeVenueWithImages(updatedVenue)
	}

	public async getVenueAvailability(
		venueId: number,
	): Promise<VenueAvailabilityResponse> {
		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		return this.venuesRepository.getVenueAvailability(venueId)
	}

	public async getVenueFull(
		venueId: number,
	): Promise<VenueFullResponse> {
		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		const availability = await this.venuesRepository.getVenueAvailability(venueId)

		// Get venue images
		const images = await this.venuesRepository.getVenueImages(venueId)

		// Get singers, menu items, cars, karnay surnay
		const singers = await this.venuesRepository.getVenueSingers(venueId)
		const menuItems = await this.venuesRepository.getVenueMenuItems(venueId)
		const cars = await this.venuesRepository.getVenueCars(venueId)
		const karnaySurnay = await this.venuesRepository.getVenueKarnaySurnay(venueId)

		const safeVenue = mapToSafeVenue(venue, images)

		return {
			venue: safeVenue,
			images: safeVenue.images,
			singers: singers.map(s => ({
				...s,
				imageUrl: normalizeStoredImageUrl(s.imageUrl),
			})),
			menuItems: menuItems.map(m => ({
				...m,
				imageUrl: normalizeStoredImageUrl(m.imageUrl),
			})),
			cars: cars.map(c => ({
				...c,
				imageUrl: normalizeStoredImageUrl(c.imageUrl),
			})),
			karnaySurnay,
			availability,
		}
	}

	public async getVenueBookingCalendar(
		venueId: number,
		userRole: 'admin' | 'owner' | 'customer' | undefined,
		userId: number | undefined,
	): Promise<VenueBookingCalendarResponse[]> {
		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		// Only owner and admin can see booking calendar
		if (userRole === 'customer') {
			throw new AppError('Forbidden', 403)
		}

		if (userRole === 'owner' && venue.owner_id !== userId) {
			throw new AppError('Forbidden', 403)
		}

		return this.venuesRepository.getVenueBookingCalendar(venueId)
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

	private async toSafeVenueWithImages(venue: VenueEntity): Promise<SafeVenue> {
		const images = await this.venuesRepository.getVenueImages(venue.id)
		return mapToSafeVenue(venue, images)
	}
}
