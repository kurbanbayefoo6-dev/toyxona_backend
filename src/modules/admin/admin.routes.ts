import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { AdminController } from './admin.controller'
import { AdminRepository } from './admin.repository'
import { AdminService } from './admin.service'

const router = Router()
const adminRepository = new AdminRepository()
const adminService = new AdminService(adminRepository)
const adminController = new AdminController(adminService)

router.use(authenticate, authorize('admin'))
router.get('/dashboard', adminController.dashboard)
router.get('/bookings', adminController.bookings)
router.get('/users', adminController.users)
router.get('/owners', adminController.owners)
router.get('/venues', adminController.venues)

export default router
