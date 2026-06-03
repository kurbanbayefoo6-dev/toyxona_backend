import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { validateIdParam } from '../../middleware/validate-params.middleware'
import { BookingsRepository } from '../bookings/bookings.repository'
import { VenuesRepository } from '../venues/venues.repository'
import { ReviewsController } from './reviews.controller'
import { ReviewsRepository } from './reviews.repository'
import { ReviewsService } from './reviews.service'

const router = Router()
const reviewsRepository = new ReviewsRepository()
const venuesRepository = new VenuesRepository()
const bookingsRepository = new BookingsRepository()
const reviewsService = new ReviewsService(
	reviewsRepository,
	venuesRepository,
	bookingsRepository,
)
const reviewsController = new ReviewsController(reviewsService)

router.get('/venues/:venueId', validateIdParam('venueId'), reviewsController.getVenueReviews)
router.use(authenticate)
router.post('/', reviewsController.create)
router.get('/my-reviews', reviewsController.getUserReviews)
router.patch('/:id', validateIdParam(), reviewsController.update)
router.delete('/:id', validateIdParam(), reviewsController.delete)

export default router
