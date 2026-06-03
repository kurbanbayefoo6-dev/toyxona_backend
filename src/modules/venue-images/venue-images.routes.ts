import { Router } from 'express'

import { upload } from '../../config/multer'
import { authenticate } from '../../middleware/authenticate.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { validateIdParam } from '../../middleware/validate-params.middleware'
import { VenuesRepository } from '../venues/venues.repository'
import { VenueImagesController } from './venue-images.controller'
import { VenueImagesRepository } from './venue-images.repository'
import { VenueImagesService } from './venue-images.service'

const router = Router()

const venueImagesRepository = new VenueImagesRepository()
const venuesRepository = new VenuesRepository()
const venueImagesService = new VenueImagesService(
	venueImagesRepository,
	venuesRepository,
)
const venueImagesController = new VenueImagesController(venueImagesService)

router.get('/:venueId/images', validateIdParam('venueId'), venueImagesController.getImages)
router.post(
	'/:venueId/images',
	validateIdParam('venueId'),
	authenticate,
	authorize('owner', 'admin'),
	upload.single('image'),
	venueImagesController.uploadImage,
)
router.delete(
	'/images/:imageId',
	validateIdParam('imageId'),
	authenticate,
	authorize('owner', 'admin'),
	venueImagesController.deleteImage,
)

export default router
