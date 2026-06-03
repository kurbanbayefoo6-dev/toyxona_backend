import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { validateIdParam } from '../../middleware/validate-params.middleware'
import { VenuesRepository } from '../venues/venues.repository'
import { FavoritesController } from './favorites.controller'
import { FavoritesRepository } from './favorites.repository'
import { FavoritesService } from './favorites.service'

const router = Router()
const favoritesRepository = new FavoritesRepository()
const venuesRepository = new VenuesRepository()
const favoritesService = new FavoritesService(
	favoritesRepository,
	venuesRepository,
)
const favoritesController = new FavoritesController(favoritesService)

router.use(authenticate, authorize('customer'))

router.get('/', favoritesController.getFavorites)
router.post(
	'/venues/:venueId',
	validateIdParam('venueId'),
	favoritesController.addFavorite,
)
router.delete(
	'/venues/:venueId',
	validateIdParam('venueId'),
	favoritesController.removeFavorite,
)

export default router
