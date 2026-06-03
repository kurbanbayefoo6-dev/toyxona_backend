import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { validateIdParam } from '../../middleware/validate-params.middleware'
import { VenuesRepository } from '../venues/venues.repository'
import { KarnaySurnayController } from './karnay-surnay.controller'
import { KarnaySurnayRepository } from './karnay-surnay.repository'
import { KarnaySurnayService } from './karnay-surnay.service'

const router = Router()
const repository = new KarnaySurnayRepository()
const venuesRepository = new VenuesRepository()
const service = new KarnaySurnayService(repository, venuesRepository)
const controller = new KarnaySurnayController(service)

router.get('/', controller.getAll)
router.get('/:id', validateIdParam(), controller.getById)
router.post('/', authenticate, authorize('owner', 'admin'), controller.create)
router.patch(
	'/:id',
	validateIdParam(),
	authenticate,
	authorize('owner', 'admin'),
	controller.update,
)
router.delete(
	'/:id',
	validateIdParam(),
	authenticate,
	authorize('owner', 'admin'),
	controller.delete,
)

export default router
