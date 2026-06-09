import { Router } from 'express'



import { authenticate } from '../../middleware/authenticate.middleware'

import { authorize } from '../../middleware/authorize.middleware'
import { optionalAuthenticate } from '../../middleware/optional-authenticate.middleware'

import { validateIdParam } from '../../middleware/validate-params.middleware'

import { VenuesController } from './venues.controller'

import { VenuesRepository } from './venues.repository'

import { VenuesService } from './venues.service'



const router = Router()



const venuesRepository = new VenuesRepository()

const venuesService = new VenuesService(venuesRepository)

const venuesController = new VenuesController(venuesService)



router.get('/', optionalAuthenticate, venuesController.getVenues)

router.get('/:id', optionalAuthenticate, validateIdParam(), venuesController.getVenueById)

router.get('/:id/full', optionalAuthenticate, validateIdParam(), venuesController.getVenueFull)

router.get(

	'/:id/availability',

	validateIdParam(),

	venuesController.getVenueAvailability,

)

router.get(

	'/:id/bookings-calendar',

	validateIdParam(),

	authenticate,

	authorize('owner', 'admin'),

	venuesController.getVenueBookingCalendar,

)

router.post(

	'/',

	authenticate,

	authorize('owner', 'admin'),

	venuesController.createVenue,

)

router.patch(

	'/:id',

	validateIdParam(),

	authenticate,

	authorize('owner', 'admin'),

	venuesController.updateVenue,

)

router.delete(

	'/:id',

	validateIdParam(),

	authenticate,

	authorize('owner', 'admin'),

	venuesController.deleteVenue,

)

router.patch(

	'/:id/status',

	validateIdParam(),

	authenticate,

	authorize('admin'),

	venuesController.updateVenueStatus,

)



export default router

