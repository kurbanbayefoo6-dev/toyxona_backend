import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { validateIdParam } from '../../middleware/validate-params.middleware'
import { VenuesRepository } from '../venues/venues.repository'
import { SingersController } from './singers.controller'
import { SingersRepository } from './singers.repository'
import { SingersService } from './singers.service'

const router = Router()
const singersRepository = new SingersRepository()
const venuesRepository = new VenuesRepository()
const singersService = new SingersService(singersRepository, venuesRepository)
const singersController = new SingersController(singersService)

router.get('/', singersController.getAll)
router.get('/:id', validateIdParam(), singersController.getById)
router.post(
	'/',
	authenticate,
	authorize('owner', 'admin'),
	singersController.create,
)
router.patch(
	'/:id',
	validateIdParam(),
	authenticate,
	authorize('owner', 'admin'),
	singersController.update,
)
router.delete(
	'/:id',
	validateIdParam(),
	authenticate,
	authorize('owner', 'admin'),
	singersController.delete,
)

export default router
