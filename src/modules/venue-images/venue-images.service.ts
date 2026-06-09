import fs from 'fs/promises'

import { deleteCloudinaryImageByUrl, uploadImageToCloudinary } from '../../config/cloudinary'
import { resolveUploadFilePath } from '../../config/uploads'
import { AppError } from '../../middleware/error.middleware'
import { idsEqual } from '../../utils/coerceId'
import { normalizeStoredImageUrl } from '../../utils/normalizeImageUrl'
import { VenuesRepository } from '../venues/venues.repository'
import { VenueImagesRepository } from './venue-images.repository'
import { SafeVenueImage, VenueImageEntity } from './venue-images.types'

export class VenueImagesService {
	constructor(
		private readonly venueImagesRepository: VenueImagesRepository,
		private readonly venuesRepository: VenuesRepository,
	) {}

	public async uploadImage(
		userId: number,
		userRole: 'admin' | 'owner',
		venueId: number,
		file?: Express.Multer.File,
	): Promise<SafeVenueImage> {
		if (!file) {
			throw new AppError('Image file is required', 400)
		}

		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		if (userRole === 'owner' && !idsEqual(venue.owner_id, userId)) {
			throw new AppError('Forbidden', 403)
		}

		const imageUrl = await uploadImageToCloudinary(file)
		const image = await this.venueImagesRepository.create(venueId, imageUrl)
		return this.toSafeImage(image)
	}

	public async getImages(
		venueId: number,
		userRole?: 'admin' | 'owner' | 'customer',
		userId?: number,
	): Promise<SafeVenueImage[]> {
		const venue = await this.venuesRepository.findById(venueId)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		if (userRole === 'owner' && !idsEqual(venue.owner_id, userId)) {
			throw new AppError('Forbidden', 403)
		}

		if (!userRole && venue.status !== 'approved') {
			throw new AppError('Venue not found', 404)
		}

		const images = await this.venueImagesRepository.findByVenueId(venueId)
		return images.map(image => this.toSafeImage(image))
	}

	public async deleteImage(
		userRole: 'admin' | 'owner',
		userId: number,
		imageId: number,
	): Promise<void> {
		const image = await this.venueImagesRepository.findById(imageId)
		if (!image) {
			throw new AppError('Image not found', 404)
		}

		const venue = await this.venuesRepository.findById(image.venue_id)
		if (!venue) {
			throw new AppError('Venue not found', 404)
		}

		if (userRole === 'owner' && !idsEqual(venue.owner_id, userId)) {
			throw new AppError('Forbidden', 403)
		}

		const deleted = await this.venueImagesRepository.deleteById(imageId)
		if (!deleted) {
			throw new AppError('Image not found', 404)
		}

		const filePath = resolveUploadFilePath(image.image_url)
		if (filePath) {
			await fs.unlink(filePath).catch(() => undefined)
			return
		}

		await deleteCloudinaryImageByUrl(image.image_url).catch(() => undefined)
	}

	private toSafeImage(image: VenueImageEntity): SafeVenueImage {
		return {
			id: image.id,
			venueId: image.venue_id,
			imageUrl:
				normalizeStoredImageUrl(image.image_url) ?? image.image_url,
		}
	}
}
