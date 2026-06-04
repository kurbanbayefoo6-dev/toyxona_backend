import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { UsersRepository } from '../users/users.repository'
import { UsersService } from '../users/users.service'
import { AdminController } from './admin.controller'
import { AdminRepository } from './admin.repository'
import { AdminService } from './admin.service'

const router = Router()
const adminRepository = new AdminRepository()
const usersRepository = new UsersRepository()
const adminService = new AdminService(adminRepository)
const usersService = new UsersService(usersRepository)
const adminController = new AdminController(adminService, usersService)

router.use(authenticate, authorize('admin'))
router.get('/dashboard', adminController.dashboard)
router.get('/bookings', adminController.bookings)
router.get('/users', adminController.users)
router.get('/owners', adminController.owners)
router.post('/owners', adminController.createOwner)
router.get('/venues', adminController.venues)

export default router
