import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { BookingsRepository } from '../bookings/bookings.repository'
import { PaymentsController } from './payments.controller'
import { PaymentsRepository } from './payments.repository'
import { PaymentsService } from './payments.service'

const router = Router()
const paymentsRepository = new PaymentsRepository()
const bookingsRepository = new BookingsRepository()
const paymentsService = new PaymentsService(
	paymentsRepository,
	bookingsRepository,
)
const paymentsController = new PaymentsController(paymentsService)

router.use(authenticate)
router.post('/', paymentsController.create)
router.get('/', paymentsController.list)

export default router
