import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { validateIdParam } from '../../middleware/validate-params.middleware'
import { VenuesRepository } from '../venues/venues.repository'
import { CarsController } from './cars.controller'
import { CarsRepository } from './cars.repository'
import { CarsService } from './cars.service'

const router = Router()
const carsRepository = new CarsRepository()
const venuesRepository = new VenuesRepository()
const carsService = new CarsService(carsRepository, venuesRepository)
const carsController = new CarsController(carsService)

router.get('/', carsController.getAll)
router.get('/:id', validateIdParam(), carsController.getById)
router.post(
	'/',
	authenticate,
	authorize('owner', 'admin'),
	carsController.create,
)
router.patch(
	'/:id',
	validateIdParam(),
	authenticate,
	authorize('owner', 'admin'),
	carsController.update,
)
router.delete(
	'/:id',
	validateIdParam(),
	authenticate,
	authorize('owner', 'admin'),
	carsController.delete,
)

export default router
