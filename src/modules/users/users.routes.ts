import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { validateIdParam } from '../../middleware/validate-params.middleware'
import { UsersController } from './users.controller'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

const router = Router()

const usersRepository = new UsersRepository()
const usersService = new UsersService(usersRepository)
const usersController = new UsersController(usersService)

router.use(authenticate)

router.get('/me', usersController.getMe)
router.get('/', authorize('admin'), usersController.getUsers)
router.patch('/', usersController.updateMe)
router.delete('/', usersController.deleteMe)
router.post('/change-password', usersController.changePassword)

router.patch('/:id', validateIdParam(), authorize('admin'), usersController.updateByAdmin)
router.delete('/:id', validateIdParam(), authorize('admin'), usersController.deleteByAdmin)

export default router
