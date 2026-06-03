import { Router } from 'express'

import { authenticate } from '../../middleware/authenticate.middleware'
import { CarsRepository } from '../cars/cars.repository'
import { KarnaySurnayRepository } from '../karnay-surnay/karnay-surnay.repository'
import { SingersRepository } from '../singers/singers.repository'
import { VenuesRepository } from '../venues/venues.repository'
import { BookingsController } from './bookings.controller'
import { BookingsRepository } from './bookings.repository'
import { BookingsService } from './bookings.service'

const router = Router()
const bookingsRepository = new BookingsRepository()
const venuesRepository = new VenuesRepository()
const singersRepository = new SingersRepository()
const carsRepository = new CarsRepository()
const karnaySurnayRepository = new KarnaySurnayRepository()
const bookingsService = new BookingsService(
	bookingsRepository,
	venuesRepository,
	singersRepository,
	carsRepository,
	karnaySurnayRepository,
)
const bookingsController = new BookingsController(bookingsService)

router.use(authenticate)
router.post('/', bookingsController.create)
router.get('/', bookingsController.list)
router.patch('/', bookingsController.update)
router.delete('/', bookingsController.delete)

export default router
