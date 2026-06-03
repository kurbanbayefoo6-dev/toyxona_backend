import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { validateIdParam } from '../../middleware/validate-params.middleware'
import { VenuesRepository } from '../venues/venues.repository'
import { MenuItemsController } from './menu-items.controller'
import { MenuItemsRepository } from './menu-items.repository'
import { MenuItemsService } from './menu-items.service'

const router = Router()
const menuItemsRepository = new MenuItemsRepository()
const venuesRepository = new VenuesRepository()
const menuItemsService = new MenuItemsService(
	menuItemsRepository,
	venuesRepository,
)
const menuItemsController = new MenuItemsController(menuItemsService)

router.get('/', menuItemsController.getAll)
router.get('/:id', validateIdParam(), menuItemsController.getById)
router.post(
	'/',
	authenticate,
	authorize('owner', 'admin'),
	menuItemsController.create,
)
router.patch(
	'/:id',
	validateIdParam(),
	authenticate,
	authorize('owner', 'admin'),
	menuItemsController.update,
)
router.delete(
	'/:id',
	validateIdParam(),
	authenticate,
	authorize('owner', 'admin'),
	menuItemsController.delete,
)

export default router
